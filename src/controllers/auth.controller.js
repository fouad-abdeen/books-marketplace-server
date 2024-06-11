import { fileURLToPath } from "url";
import { BaseService } from "../core/base.service.js";
import { Context } from "../core/context.js";
import { AuthService } from "../services/auth.service.js";
import { getService } from "../core/config/container.config.js";
import { encrypt } from "../core/utils/encryption.js";

export class AuthController extends BaseService {
  _authService;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    super(__filename);
    this._authService = getService("authService", AuthService);
    this.signup = this.signup.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.verifyEmail = this.verifyEmail.bind(this);
    this.requestPasswordReset = this.requestPasswordReset.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
  }

  async signup(req, res, next) {
    try {
      const signupRequest = req.body;

      this.setRequestId();
      this._logger.info("Received a request to sign up a new user");

      const createdUser = await this._authService.signUpUser(signupRequest);

      res.status(201).json(createdUser);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const loginRequest = req.body;

      this.setRequestId();
      this._logger.info("Received a request to sign in a user");

      const authResponse = await this._authService.signInUser(loginRequest);
      const { tokens, ...user } = authResponse;

      res.status(200);

      const enncryptedAccessToken = encrypt(tokens.accessToken),
        encryptedRefreshToken = encrypt(tokens.refreshToken);

      res.setHeader("Set-Cookie", [
        `accessToken=${enncryptedAccessToken}; HttpOnly; Secure; SameSite=None;`,
        `refreshToken=${encryptedRefreshToken}; HttpOnly; Secure; SameSite=None;`,
      ]);

      res.cookie("accessToken", enncryptedAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      res.cookie("refreshToken", encryptedRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      this.setRequestId();
      this._logger.info("Requesting user logout");

      const accessToken = req.cookies["accessToken"];
      const refreshToken = req.cookies["refreshToken"];

      await this._authService.signOutUser({ accessToken, refreshToken });

      res.status(200);

      res.setHeader("Set-Cookie", [
        `accessToken=; HttpOnly; Secure; SameSite=None; Expires=${new Date(
          0
        ).toUTCString()};`,
        `refreshToken=; HttpOnly; Secure; SameSite=None; Expires=${new Date(
          0
        ).toUTCString()};`,
      ]);

      res.cookie("accessToken", "", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(0),
      });

      res.cookie("refreshToken", "", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(0),
      });

      res.json(null);
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const { token } = req.query;

      this.setRequestId();
      this._logger.info("Received a request to verify an email address");

      await this._authService.verifyEmailAddress(token);

      res.status(200).json(null);
    } catch (error) {
      next(error);
    }
  }

  async requestPasswordReset(req, res, next) {
    try {
      const { email } = req.query;

      this.setRequestId();
      this._logger.info(
        "Received a request to send password reset link to a user"
      );

      await this._authService.sendPasswordResetLink(email);

      res.status(200).json(null);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;

      this.setRequestId();
      this._logger.info("Requesting password reset");

      await this._authService.resetPassword(token, password);

      res.status(200).json(null);
    } catch (error) {
      next(error);
    }
  }
}
