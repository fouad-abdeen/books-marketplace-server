import {
  isEmail,
  isNotEmpty,
  isNumber,
  isPhoneNumber,
  isURL,
  maxLength,
} from "class-validator";
import { fileURLToPath } from "url";
import { BaseService } from "../core/base.service.js";
import { Context } from "../core/context.js";
import { throwError } from "../core/utils/error.js";
import { getService } from "../core/config/container.config.js";
import { env } from "../core/config/env.config.js";
import { BookstoreRepository } from "../repositories/bookstore.repository.js";
import { FileRepository } from "../repositories/file.repository.js";

export class BookstoreService extends BaseService {
  _fileService;
  _bookstoreRepository;
  _fileRepository;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    super(__filename);
    this._fileService = getService("fileService");
    this._bookstoreRepository = getService(
      "bookstoreRepository",
      BookstoreRepository
    );
    this._fileRepository = getService("fileRepository", FileRepository);
  }

  async createBookstore(bookstore) {
    bookstore.owner = Context.getUser()._id.toString();
    bookstore.isActive = false;
    bookstore.logo = null;
    const bookstoreExists = await this._bookstoreRepository.getBookstore({
      $or: [{ name: bookstore.name }, { owner: bookstore.owner }],
    });
    if (bookstoreExists)
      throwError(
        "Bookstore name is already taken or you already registered a bookstore",
        400
      );
    this.#validateBookstoreCreation(bookstore);
    return await this._bookstoreRepository.createBookstore(bookstore);
  }

  async updateBookstore(id, data) {
    delete data.owner;
    delete data.isActive;
    delete data.logo;
    this.#validateBookstoreUpdate(data);
    return await this._bookstoreRepository.updateBookstore(id, data);
  }

  async uploadBookstoreLogo(bookstore, file) {
    this.setRequestId();
    this._logger.info(
      `Attempting to upload logo for bookstore ${bookstore._id}`
    );

    const { originalname, buffer, size } = file;

    const maxLogoSize = 2 * 1024 * 1024; // 1MB
    if (size > maxLogoSize) throwError(`File size must be less than 1MB`, 400);

    let fileInfo = {};

    try {
      // Upload file to S3
      fileInfo = await this._fileService.uploadFile(
        `bookstore-${bookstore._id}`,
        `${originalname.split(".").pop()}`,
        buffer,
        env.awsS3.bucket,
        "bookstore-logos/",
        ["png", "jpg", "jpeg"]
      );
    } catch (error) {
      this._logger.error(error.message);
      throwError(`Failed to upload the bookstore logo. ${error.message}`, 400);
    }

    if (!bookstore.logo) {
      // Create a new file in the database
      const file = await this._fileRepository.createFile(fileInfo);

      // Update the bookstore's logo
      await this._bookstoreRepository.updateBookstore(bookstore._id, {
        logo: file._id,
      });
    }

    return fileInfo;
  }

  async deleteBookstoreLogo(bookstore) {
    if (!bookstore.logo) return;

    this.setRequestId();
    this._logger.info(
      `Attempting to delete logo for bookstore ${bookstore._id}`
    );

    try {
      const file = await this._fileRepository.getFile(bookstore.logo);

      // Delete file from S3
      await this._fileService.deleteFile(file.key, env.awsS3.bucket);

      // Delete file from the database
      await this._fileRepository.deleteFile(file._id);
    } catch (error) {
      this._logger.error(error.message);
      throwError(`Failed to delete the bookstore logo. ${error.message}`, 400);
    }

    await this._bookstoreRepository.updateBookstore(bookstore._id, {
      logo: null,
    });
  }

  #validateBookstoreCreation(bookstore) {
    const {
      name,
      description,
      phone,
      shippingRate,
      address,
      email,
      socialmedia,
    } = bookstore;

    if (!isNotEmpty(name) || !maxLength(name, 50))
      throwError("Name is required and should not exceed 50 characters", 400);

    if (!isNotEmpty(description) || !maxLength(description, 500))
      throwError(
        "Description is required and should not exceed 500 characters",
        400
      );

    if (!isNotEmpty(phone) || !isPhoneNumber(phone))
      throwError(
        "Invalid phone number. Please provide a valid phone number with country code",
        400
      );

    if (!isNumber(shippingRate)) throwError("Invalid shipping rate", 400);

    if (!isNotEmpty(address) || !maxLength(address, 150))
      throwError(
        "Address is required and should not exceed 150 characters",
        400
      );

    if (email && !isEmail(email)) throwError("Invalid email address", 400);

    if (socialmedia) {
      if (socialmedia.facebook && !isURL(socialmedia.facebook))
        throwError("Invalid Facebook URL", 400);

      if (socialmedia.instagram && !isURL(socialmedia.instagram))
        throwError("Invalid Instagram URL", 400);

      if (socialmedia.twitter && !isURL(socialmedia.twitter))
        throwError("Invalid Twitter URL", 400);

      if (socialmedia.linkedIn && !isURL(socialmedia.linkedIn))
        throwError("Invalid LinkedIn URL", 400);
    }
  }

  #validateBookstoreUpdate(bookstore) {
    const {
      name,
      description,
      phone,
      shippingRate,
      address,
      email,
      socialmedia,
    } = bookstore;

    if (name !== undefined && (!isNotEmpty(name) || !maxLength(name, 50)))
      throwError(
        "Name cannot be empty and should not exceed 50 characters",
        400
      );

    if (
      description !== undefined &&
      (!isNotEmpty(description) || !maxLength(description, 500))
    )
      throwError(
        "Description cannot be empty and should not exceed 500 characters",
        400
      );

    if (phone !== undefined && (!isNotEmpty(phone) || !isPhoneNumber(phone)))
      throwError(
        "Invalid phone number. Please provide a valid phone number with country code",
        400
      );

    if (shippingRate !== undefined && !isNumber(shippingRate))
      throwError("Invalid shipping rate", 400);

    if (
      address !== undefined &&
      (!isNotEmpty(address) || !maxLength(address, 150))
    )
      throwError(
        "Address cannot be empty and should not exceed 150 characters",
        400
      );

    if (email && !isEmail(email)) throwError("Invalid email address", 400);

    if (socialmedia) {
      if (socialmedia.facebook && !isURL(socialmedia.facebook))
        throwError("Invalid Facebook URL", 400);

      if (socialmedia.instagram && !isURL(socialmedia.instagram))
        throwError("Invalid Instagram URL", 400);

      if (socialmedia.twitter && !isURL(socialmedia.twitter))
        throwError("Invalid Twitter URL", 400);

      if (socialmedia.linkedIn && !isURL(socialmedia.linkedIn))
        throwError("Invalid LinkedIn URL", 400);
    }
  }
}
