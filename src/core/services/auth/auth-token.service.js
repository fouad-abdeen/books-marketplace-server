// @ts-nocheck
import pkg from "jsonwebtoken";
import { fileURLToPath } from "url";
import { BaseService } from "../../base.service.js";

const { sign, TokenExpiredError, verify } = pkg;

export class AuthTokenService extends BaseService {
  maxExpiryDuration = 172800; // 48 hours in seconds
  minExpiryDuration = 900; // 15 minutes in seconds
  secret;

  /**
   * @param {string} secret secret key to sign the JWT token
   */
  constructor(secret) {
    const __filename = fileURLToPath(import.meta.url);
    super(__filename);
    this.secret = secret;
  }

  /**
   * Generates or signs a JWT token
   * @param {any} payload data to store in the token. It can be a string, buffer, or plain object
   * @param {SignOptions} options token sign options that mainly must include the expiry duration (expiresIn),
   * the value of this property should be a number of seconds or a string that represents a timespan like "1d", "24h", or "1440m"
   * @returns generated JWT token
   */
  generateToken(payload, options) {
    let token;

    // The expiry duration should be at least 15 minutes and at most 48 hours.
    const numberOfSeconds = Math.min(
      this.parseExpiration(options.expiresIn),
      this.maxExpiryDuration
    );

    try {
      token = sign(payload, this.secret, {
        ...options,
        // We can set the expiresIn option only if the payload is an object.
        expiresIn:
          typeof payload === "string" || Buffer.isBuffer(payload)
            ? undefined
            : numberOfSeconds,
      });
    } catch (error) {
      this._logger.error("Error signing token:", error.message);
      throw new Error(error.message);
    }

    return token;
  }

  /**
   * Verifies the signature of a JWT token and decodes the payload if the signature is valid
   *
   * @param {string} token JWT token to verify
   * @param {VerifyOptions} options options for the verification
   * @param {boolean} [skipExpiredError] if true, no error will be thrown if the token is expired (useful for refreshing tokens)
   * @returns decoded payload or null
   */
  verifyToken(token, options, skipExpiredError = false) {
    try {
      return verify(token, this.secret, options);
    } catch (error) {
      if (skipExpiredError && error instanceof TokenExpiredError) {
        return null;
      }

      this._logger.error("Error verifying token:", error.message);
      throw new Error(error.message);
    }
  }

  parseExpiration(expiresIn) {
    if (typeof expiresIn === "number" && expiresIn > this.minExpiryDuration)
      return expiresIn;

    if (typeof expiresIn === "string") {
      if (expiresIn.endsWith("m")) return parseInt(expiresIn.slice(0, -1)) * 60;

      if (expiresIn.endsWith("h"))
        return parseInt(expiresIn.slice(0, -1)) * 3600;

      if (expiresIn.endsWith("d"))
        return parseInt(expiresIn.slice(0, -1)) * 86400;

      const numberOfSeconds = parseInt(expiresIn);

      if (!isNaN(numberOfSeconds) && numberOfSeconds > this.minExpiryDuration)
        return numberOfSeconds;
    }

    return this.minExpiryDuration;
  }
}
