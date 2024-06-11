import {
  isEmail,
  isNotEmpty,
  maxLength,
  isStrongPassword,
} from "class-validator";
import { fileURLToPath } from "url";
import { BaseService } from "../core/base.service.js";
import { Context } from "../core/context.js";
import { getService } from "../core/config/container.config.js";
import { env } from "../core/config/env.config.js";
import { throwError } from "../core/utils/error.js";
import { decrypt, encrypt } from "../core/utils/encryption.js";
import { authTokenType, mailTemplateType, userRole } from "../shared/enums.js";
import { UserRepository } from "../repositories/user.repository.js";

export class AuthService extends BaseService {
  _hashService;
  _tokenService;
  _mailService;
  _userRepository;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    super(__filename);

    this._hashService = getService("hashService");
    this._tokenService = getService("tokenService");
    this._mailService = getService("mailService");
    this._userRepository = getService("userRepository", UserRepository);
  }

  /**
   * Authorizes the user to access protected routes
   * @param {object} request express request object
   * @param {object} response express response object
   * @param {object} authority object containing roles and disclaimer
   */
  async authorizeUser(request, response, authority) {
    let accessToken = request.cookies["accessToken"];
    let user;

    this.setRequestId();
    this._logger.info("Attempting to authorize user");

    // #region Verify Authorization Access Token
    this._logger.info("Verifying authorization access token");

    if (!accessToken)
      throwError("Unauthorized, missing authorization access token", 401);

    let payload = {};

    try {
      // Verify the access token and get the payload
      // If the token is expired, null will be returned
      payload = this._tokenService.verifyToken(decrypt(accessToken), {}, true);

      if (payload)
        if (payload.tokenType !== authTokenType.ACCESS_TOKEN)
          throwError("invalid token", 401);
    } catch (error) {
      throwError(
        `Failed to verify authorization access token, ${error.message}`,
        401
      );
    }

    // If access token is expired, attempt to refresh it
    if (!payload) {
      const refreshToken = request.cookies["refreshToken"];

      if (!refreshToken) throwError("Unauthorized, missing refresh token", 401);

      this._logger.info("Attempting to refresh access token");

      try {
        const tokens = this.#refreshAccessToken(decrypt(refreshToken));

        // Set the new access and refresh tokens in the response cookies
        response.cookie("accessToken", encrypt(tokens.accessToken), {
          httpOnly: true,
          secure: true,
        });

        response.cookie("refreshToken", encrypt(tokens.refreshToken), {
          httpOnly: true,
          secure: true,
        });

        // Get the payload from the new access token
        payload = this._tokenService.verifyToken(tokens.accessToken);
      } catch (error) {
        this._logger.error(
          "Failed to refresh access token, logging out the user"
        );

        // Clear the cookies as the refresh token is invalid
        response.cookie("accessToken", "", {
          httpOnly: true,
          secure: true,
          expires: new Date(0),
        });

        response.cookie("refreshToken", "", {
          httpOnly: true,
          secure: true,
          expires: new Date(0),
        });
      }
    }

    user = await this._userRepository.getUserByEmail(payload.email);
    user._id = user._id.toString();

    // Deny access if the user's password was updated after the access token was issued
    if (
      payload.signedAt < user.passwordUpdatedAt ||
      user.tokensDenylist.find((object) => object.token === accessToken)
    )
      throwError("Authorization token is not valid anymore", 401);
    // #endregion

    if (!user.isVerified)
      throwError(
        "Your account is inactive. Please verify your email address or contact us to activate your account.",
        403
      );

    if (authority) {
      const { roles, disclaimer } = authority;

      this._logger.info("Verifying user's role");

      if (!roles.includes(user.role))
        throwError(
          disclaimer ?? "Unauthorized, user does not have the required role",
          403
        );
    }

    this._logger.info("Setting user in Context");
    Context.setUser(user);
  }

  async signUpUser(userSignupData) {
    this.#validateSignupRequest(userSignupData);

    if (userSignupData.isBookstoreOwner)
      userSignupData.role = userRole.BOOKSTORE_OWNER;
    else userSignupData.role = userRole.USER;

    this.setRequestId();
    this._logger.info(
      `Attempting to sign up user with email: ${userSignupData.email}`
    );

    this._logger.info(`Hashing user's password`);
    userSignupData.password = await this._hashService.hashPassword(
      userSignupData.password
    );

    let createdUser = {};

    try {
      createdUser = await this._userRepository.createUser(userSignupData);
    } catch (error) {
      if (error.message.split("dup key: { email: ").length > 1) {
        throwError(
          "A user with this email already exists. Please choose a different email.",
          409
        );
      }
    }

    const { _id, email, name } = createdUser;
    const id = _id.toString();

    const emailVerificationToken = this._tokenService.generateToken(
      {
        identityId: id,
        email,
        tokenType: authTokenType.EMAIL_VERIFICATION_TOKEN,
      },
      { expiresIn: env.auth.emailVerificationTokenExpiresIn }
    );

    this._logger.info(`Sending email verification mail to ${email}`);

    await this._mailService.sendMail(
      {
        name,
        email,
      },
      "Verify your Email",
      this._mailService.parseMailTemplate(mailTemplateType.EMAIL_VERIFICATION, {
        USER_NAME: name,
        CALL_TO_ACTION_URL: `${env.frontend.emailVerificationUrl}?token=${emailVerificationToken}`,
      })
    );

    return createdUser;
  }

  async signInUser({ email, password }) {
    await this.#validateLoginRequest(email, password);

    this.setRequestId();
    this._logger.info(`Attempting to sign in user with ${email}`);

    this._logger.info(`Checking user's ${email}`);
    const user = await this._userRepository.getUserByEmail(email);

    if (!user.isVerified)
      throwError(
        "Your account is inactive. Please verify your email address or contact us to activate your account.",
        403
      );

    this._logger.info("Clearing user's expired tokens from Denylist");

    const currentTimestampInSeconds = Math.floor(Date.now() / 1000);

    const updatedtokensDenylist = user.tokensDenylist.filter(
      (token) => token.expiresIn > currentTimestampInSeconds
    );

    await this._userRepository.updateUser({
      _id: user._id,
      tokensDenylist: updatedtokensDenylist,
    });

    this._logger.info(`Verifying user's password`);
    const passwordMatch = await this._hashService.verifyPassword(
      password,
      user.password
    );

    if (!passwordMatch) throwError("Invalid password", 401);

    delete user.password;
    delete user.tokensDenylist;
    delete user.passwordUpdatedAt;

    const tokens = this.#getTokens({
      identityId: user._id.toString(),
      email: user.email,
      signedAt: +new Date(),
    });

    return {
      ...user,
      tokens,
    };
  }

  async signOutUser(tokens) {
    this.setRequestId();
    this._logger.info(
      `Attempting to sign out user by invalidating their tokens`
    );

    let identityId = "";
    const invalidatedTokens = [];

    // #region Verify Access Token
    try {
      const authPayload = this._tokenService.verifyToken(
        decrypt(tokens.accessToken),
        {},
        true
      );

      if (authPayload) {
        identityId = authPayload.identityId;
        invalidatedTokens.push({
          token: tokens.accessToken,
          expiresIn: authPayload.exp,
        });
      }
    } catch (error) {
      this._logger.error(`Failed to verify access token, ${error.message}`);
    }
    // #endregion

    // #region Verify Refresh Token
    try {
      if (!tokens.refreshToken) throwError("missing refresh token", 401);
      const authPayload = this._tokenService.verifyToken(
        decrypt(tokens.refreshToken)
      );

      if (!identityId) identityId = authPayload.identityId;
      invalidatedTokens.push({
        token: tokens.refreshToken,
        expiresIn: authPayload.exp,
      });
    } catch (error) {
      throwError(`Failed to verify refresh token, ${error.message}`, 401);
    }
    // #endregion

    this._logger.info(
      "Adding access and refresh tokens to the user's Denylist"
    );

    const updatedUserData = {
      _id: identityId,
      $addToSet: {
        tokensDenylist: {
          $each: invalidatedTokens,
        },
      },
    };

    await this._userRepository.updateUser(updatedUserData);
  }

  async verifyEmailAddress(token) {
    let id = "",
      email = "",
      tokenExpiry = 0,
      tokensDenylist = [];

    this.setRequestId();
    this._logger.info("Attempting to verify email address");

    try {
      const authPayload = this._tokenService.verifyToken(token);

      if (authPayload.tokenType !== authTokenType.EMAIL_VERIFICATION_TOKEN)
        throw new Error("invalid token");

      id = authPayload.identityId;
      email = authPayload.email;
      tokenExpiry = authPayload.exp;
    } catch (error) {
      throw new Error("Failed to verify email address, invalid token");
    }

    try {
      const user = await this._userRepository.getUserByEmail(email);
      tokensDenylist = user.tokensDenylist;

      if (tokensDenylist.find((object) => object.token === token))
        throw new Error("token is already used");
    } catch (error) {
      throw new Error(`Failed to verify email address, ${error.message}`);
    }

    this._logger.info("Adding email verification token to the user's Denylist");
    const updatedtokensDenylist = [
      ...tokensDenylist,
      { token, expiresIn: tokenExpiry },
    ];

    this._logger.info(`Verifying email address for user with email ${email}`);
    await this._userRepository.updateUser({
      _id: id,
      isVerified: true,
      tokensDenylist: updatedtokensDenylist,
    });
  }

  async sendPasswordResetLink(email) {
    this.setRequestId();
    this._logger.info(`Attempting to send password reset link to ${email}`);

    this._logger.info(`checking user's email ${email}`);
    const user = await this._userRepository.getUserByEmail(email);

    if (!user.isVerified) throwError(`${email} is not verified`, 403);

    const id = user._id.toString();
    const name = user.firstName;

    const passwordResetToken = this._tokenService.generateToken(
      {
        identityId: id,
        email,
        tokenType: authTokenType.PASSWORD_RESET_TOKEN,
      },
      { expiresIn: env.auth.passwordResetTokenExpiresIn }
    );

    this._logger.info(`Sending password reset email to ${email}`);

    await this._mailService.sendMail(
      {
        name,
        email,
      },
      "Reset your password",
      this._mailService.parseMailTemplate(mailTemplateType.PASSWORD_RESET, {
        USER_NAME: name,
        CALL_TO_ACTION_URL: `${env.frontend.passwordResetUrl}?token=${passwordResetToken}`,
      })
    );
  }

  async resetPassword(token, password) {
    let id = "",
      email = "",
      verified = false,
      tokenExpiry = 0,
      tokensDenylist = [];

    this.setRequestId();
    this._logger.info("Attempting to reset password");

    // #region Verify Token
    try {
      const authPayload = this._tokenService.verifyToken(token);

      if (authPayload.tokenType !== authTokenType.PASSWORD_RESET_TOKEN)
        throw new Error("invalid token");

      id = authPayload.identityId;
      email = authPayload.email;
      tokenExpiry = authPayload.exp;
    } catch (error) {
      throw new Error("Failed to reset password, invalid token");
    }

    try {
      const user = await this._userRepository.getUserByEmail(email);

      verified = user.isVerified;
      tokensDenylist = user.tokensDenylist;

      if (tokensDenylist.find((object) => object.token === token))
        throw new Error(`token is already used`);
    } catch (error) {
      throw new Error(`Failed to reset password, ${error.message}`);
    }
    // #endregion

    if (!verified) throw new Error(`${email} is not verified`);

    this._logger.info("Adding password reset token to the user's Denylist");
    const updatedtokensDenylist = [
      ...tokensDenylist,
      { token, expiresIn: tokenExpiry },
    ];

    const hashedPassword = await this._hashService.hashPassword(password);

    this._logger.info(`Resetting password for user with email ${email}`);
    await this._userRepository.updateUser({
      _id: id,
      password: hashedPassword,
      passwordUpdatedAt: +new Date(),
      tokensDenylist: updatedtokensDenylist,
    });
  }

  async updatePassword({ currentPassword, newPassword, terminateAllSessions }) {
    const user = Context.getUser();

    this.setRequestId();
    this._logger.info(
      `Attempting to update password for user with id ${user._id}`
    );

    const passwordMatch = await this._hashService.verifyPassword(
      currentPassword,
      user.password
    );
    if (!passwordMatch) throw new Error("Current password is incorrect");

    const hashedPassword = await this._hashService.hashPassword(newPassword);

    this._logger.info(`Updating password for user with id ${user._id}`);

    await this._userRepository.updateUser({
      _id: user._id,
      password: hashedPassword,
      // If terminateAllSessions is true, update the passwordUpdatedAt field to invalidate all previous sessions
      ...(terminateAllSessions ? { passwordUpdatedAt: +new Date() } : {}),
    });
  }

  #refreshAccessToken(refreshToken) {
    let identityId = "",
      email = "",
      tokenExpiry = 0;

    this.setRequestId();
    this._logger.info("Verifying refresh token");

    try {
      const payload = this._tokenService.verifyToken(refreshToken);

      if (payload.tokenType !== authTokenType.REFRESH_TOKEN)
        throwError("invalid token", 401);

      identityId = payload.identityId;
      email = payload.email;
    } catch (error) {
      throwError("Failed to verify refresh token", 401);
    }

    this._logger.info(
      `Rotating refresh token to generate new access token for user with email ${email}`
    );

    const updateUserData = {
      _id: identityId,
      $addToSet: {
        tokensDenylist: {
          token: refreshToken,
          expiresIn: tokenExpiry,
        },
      },
    };

    // Invalidate the refresh token
    this._userRepository.updateUser(updateUserData);

    // Generate new access and refresh tokens
    const newTokens = this.#getTokens({
      identityId,
      email,
      signedAt: +new Date(),
    });

    return newTokens;
  }

  #getTokens(payload) {
    this.setRequestId();

    this._logger.info("Generating access token");
    const accessToken = this._tokenService.generateToken(
      { ...payload, tokenType: authTokenType.ACCESS_TOKEN },
      {
        expiresIn: env.auth.accessTokenExpiresIn,
      }
    );

    this._logger.info("Generating refresh token");
    const refreshToken = this._tokenService.generateToken(
      { ...payload, tokenType: authTokenType.REFRESH_TOKEN },
      {
        expiresIn: env.auth.refreshTokenExpiresIn,
      }
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  // #region Validators
  #validateSignupRequest(signupRequest) {
    const errors = [];

    if (!isEmail(signupRequest.email))
      errors.push("Invalid or missing email address");

    if (!isNotEmpty(signupRequest.name) || !maxLength(signupRequest.name, 50))
      errors.push(
        "Name cannot be empty and cannot be longer than 50 characters"
      );

    // Add your own logic to validate password strength
    if (
      !isStrongPassword(signupRequest.password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    )
      errors.push(
        "Weak password. Password should contain at least 8 characters, 1 lowercase, 1 uppercase, 1 number and 1 symbol"
      );

    if (errors.length > 0) throwError(errors[0], 400);
  }

  #validateLoginRequest(email, password) {
    const errors = [];
    if (!isEmail(email)) errors.push("Invalid or missing email address");
    if (!isNotEmpty(password)) errors.push("Password cannot be empty");
    if (errors.length > 0) throwError(errors[0], 400);
  }
  // #endregion
}
