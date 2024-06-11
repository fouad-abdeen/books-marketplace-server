import { fileURLToPath } from "url";
import { BaseService } from "../core/base.service.js";
import { Context } from "../core/context.js";
import { getService } from "../core/config/container.config.js";
import { UserService } from "../services/user.service.js";

export class UserController extends BaseService {
  _userService;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    super(__filename);
    this._userService = getService("userService", UserService);
    this.getAuthenticatedUser = this.getAuthenticatedUser.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.updateCustomerInfo = this.updateCustomerInfo.bind(this);
  }

  async getAuthenticatedUser(req, res, next) {
    try {
      const user = Context.getUser();

      this.setRequestId();
      this._logger.info(
        `Received a request to get info of the authenticated user: ${user._id}`
      );

      delete user.password;
      delete user.tokensDenylist;
      delete user.passwordUpdatedAt;

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async updatePassword(req, res, next) {
    try {
      const passwordUpdateRequest = req.body;

      this.setRequestId();
      this._logger.info("Requesting password update");

      await this._userService.updatePassword(passwordUpdateRequest);

      if (passwordUpdateRequest.terminateAllSessions) {
        res.setHeader("Set-Cookie", [
          `accessToken=; HttpOnly; Secure; SameSite=None; Expires=${new Date(
            0
          )};`,
          `refreshToken=; HttpOnly; Secure; SameSite=None; Expires=${new Date(
            0
          )};`,
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
      }

      res.status(200).json(null);
    } catch (error) {
      next(error);
    }
  }

  async updateCustomerInfo(req, res, next) {
    try {
      this.setRequestId();
      this._logger.info(
        "Received a request to update a customer's information"
      );
      const user = await this._userService.updateCustomerInfo(req.body);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
}
