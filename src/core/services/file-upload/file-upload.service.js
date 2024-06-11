import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { fileURLToPath } from "url";
import { BaseService } from "../../base.service.js";

export class FileUploadService extends BaseService {
  _instance;
  _region;
  _endpoint;

  /**
   * @param {S3Credentials} credentials AWS S3 credentials
   * @param {string} region AWS S3 region
   * @param {string} [endpoint] Custom AWS S3 endpoint
   */
  constructor(credentials, region, endpoint) {
    const __filename = fileURLToPath(import.meta.url);
    super(__filename);
    this._instance = new S3Client({
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
      region,
      endpoint,
    });
    this._region = region;
    this._endpoint = endpoint;
  }

  /**
   * Uploads a file to AWS S3.
   * @param {string} name File name (without extension)
   * @param {string} fileExtension File extension (without dot)
   * @param {any} content File content
   * @param {string} bucket S3 bucket name
   * @param {string} [storagePath] The storage path (optional, e.g. "avatars/") -
   * if not provided, the file will be uploaded to the root of the bucket
   * @param {string[]} [allowedExtensions] Allowed file extensions (optional) - if not provided, any extension is allowed
   * @returns File info (URL and key)
   */
  async uploadFile(
    name,
    fileExtension,
    content,
    bucket,
    storagePath = "/",
    allowedExtensions
  ) {
    const fileInfo = this.#getFileInfo(
      name,
      fileExtension,
      bucket,
      storagePath,
      allowedExtensions
    );

    const uploadParams = {
      Bucket: bucket,
      Key: fileInfo.key,
      Body: content,
    };

    try {
      await this._instance.send(new PutObjectCommand(uploadParams));
      return fileInfo;
    } catch (error) {
      this._logger.error(`AWS error found. Error details: `, error.message);
      throw new Error(error.message);
    }
  }

  /**
   * Deletes a file from AWS S3.
   * @param {string} key File key (storage path + name + extension)
   * @param {string} bucket S3 bucket name
   */
  async deleteFile(key, bucket) {
    const params = { Key: key, Bucket: bucket };

    try {
      await this._instance.send(new DeleteObjectCommand(params));
    } catch (error) {
      this._logger.error(`AWS error found. Error details: `, error.message);
      throw new Error(error.message);
    }
  }

  /**
   * Gets an object from AWS S3.
   * @param {string} key File key (storage path + name + extension)
   * @param {string} bucket S3 bucket name
   * @returns File object
   */
  async getObject(key, bucket) {
    const params = { Key: key, Bucket: bucket };

    try {
      const command = new GetObjectCommand(params);

      const object = await this._instance.send(command);

      return object;
    } catch (error) {
      this._logger.error(`AWS error found. Error details: `, error.message);
      throw new Error(error.message);
    }
  }

  /**
   * Creates a pre-signed URL for a file object in AWS S3.
   * @param {string} key File key (storage path + name + extension)
   * @param {string} bucket S3 bucket name
   * @param {number} [signedUrlExpireSeconds] The number of seconds until the signed URL expires,
   * optional, default is set to 300 seconds (5 minutes)
   * @returns Signed URL
   */
  async getSignedURL(key, bucket, signedUrlExpireSeconds = 300) {
    const params = { Key: key, Bucket: bucket };

    try {
      const command = new GetObjectCommand(params);

      const signedUrl = await getSignedUrl(this._instance, command, {
        expiresIn: signedUrlExpireSeconds,
      });

      return signedUrl;
    } catch (error) {
      this._logger.error(`AWS error found. Error details: `, error.message);
      throw new Error(error.message);
    }
  }

  #getFileInfo(name, fileExtension, bucket, storagePath, allowedExtensions) {
    // const filename = `${name}.${fileExtension}`;
    const fileKey = `${storagePath}${name}`;

    if (allowedExtensions) {
      fileExtension = fileExtension.toLowerCase();
      allowedExtensions = allowedExtensions.map((extension) =>
        extension.toLowerCase()
      );

      const allowedExtensionsString = allowedExtensions.join(", ");

      if (allowedExtensions.indexOf(fileExtension) === -1)
        throw new Error(
          `Cannot upload a file with the extension ${fileExtension}.` +
            ` Only files of the following extensions are allowed: ${allowedExtensionsString}`
        );
    }

    const fileInfo = {
      url:
        (this._endpoint ?? `s3-${this._region}.amazonaws.com`) +
        `/${bucket}/${fileKey}`,
      key: fileKey,
    };

    return fileInfo;
  }
}

/**
 * @typedef {Object} S3Credentials
 * @property {string} accessKeyId - AWS access key ID
 * @property {string} secretAccessKey - AWS secret access key
 * @property {string} [sessionToken] - A security or session token to use with these credentials. Usually present for temporary credentials.
 * @property {Date} [expiration] - A {Date} when these credentials will no longer be accepted.
 */

/**
 * @typedef {Object} FileInfo
 * @property {string} url - Full URL of file
 * @property {string} key - Key of file (storage path + name + extension)
 */

/**
 * @typedef {Object} FileUpload
 * @property {string} fieldname - Name of field in multipart request
 * @property {string} originalname - Original file name
 * @property {string} encoding - Encoding of file e.g. 7bit
 * @property {string} mimetype - Type of file e.g. image/png
 * @property {Buffer} buffer - File data
 * @property {number} size - Size of file in bytes
 */
