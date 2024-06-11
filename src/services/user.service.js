import { fileURLToPath } from "url";
import { BaseService } from "../core/base.service.js";
import { Context } from "../core/context.js";
import { getService } from "../core/config/container.config.js";
import { throwError } from "../core/utils/error.js";
import { UserRepository } from "../repositories/user.repository.js";
import {
  isNotEmpty,
  isPhoneNumber,
  isString,
  maxLength,
} from "class-validator";

export class UserService extends BaseService {
  _hashService;
  _userRepository;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    super(__filename);
    this._hashService = getService("hashService");
    this._userRepository = getService("userRepository", UserRepository);
  }

  async updatePassword({ currentPassword, newPassword, terminateAllSessions }) {
    const { _id, password: actualPassword } = Context.getUser();

    this.setRequestId();
    this._logger.info(`Attempting to update password for user with id ${_id}`);

    const passwordMatch = await this._hashService.verifyPassword(
      currentPassword,
      actualPassword
    );
    if (!passwordMatch) throw new Error("Current password is incorrect");

    const hashedPassword = await this._hashService.hashPassword(newPassword);

    this._logger.info(`Updating password for user with id ${_id}`);

    await this._userRepository.updateUser({
      _id,
      password: hashedPassword,
      // If terminateAllSessions is true, update the passwordUpdatedAt field to invalidate all previous user sessions
      ...(terminateAllSessions ? { passwordUpdatedAt: +new Date() } : {}),
    });
  }

  async updateCustomerInfo(customerInfo) {
    const { _id } = Context.getUser();
    this.#validateCustomerInfo(customerInfo);
    return await this._userRepository.updateUser({ _id, customerInfo });
  }

  #validateCustomerInfo(customerInfo) {
    const { firstName, lastName, phone, address } = customerInfo;

    if (
      !isString(firstName) ||
      !isNotEmpty(firstName) ||
      !maxLength(firstName, 50)
    ) {
      throwError(
        "First name is required and should not exceed 50 characters",
        400
      );
    }

    if (
      !isString(lastName) ||
      !isNotEmpty(lastName) ||
      !maxLength(lastName, 50)
    ) {
      throwError(
        "Last name is required and should not exceed 50 characters",
        400
      );
    }

    if (!isNotEmpty(phone) || !isPhoneNumber(phone))
      throwError(
        "Invalid phone number. Please provide a valid phone number with country code",
        400
      );

    if (!isString(address) || !isNotEmpty(address) || !maxLength(address, 250))
      throwError(
        "Address is required and should not exceed 250 characters",
        400
      );
  }
}
