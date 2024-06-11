import { getService } from "../core/config/container.config.js";

class AuthMiddleware {
  _authService;

  constructor() {}

  authorize(authority) {
    if (!this._authService) this._authService = getService("authService");

    return async (req, res, next) => {
      try {
        await this._authService.authorizeUser(req, res, authority);
        next();
      } catch (error) {
        next(error);
      }
    };
  }
}

export const authMiddleware = new AuthMiddleware();
