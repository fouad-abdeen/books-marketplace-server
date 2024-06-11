import { AuthHashService } from "../services/auth/auth-hash.service.js";
import { AuthTokenService } from "../services/auth/auth-token.service.js";
import { FileUploadService } from "../services/file-upload/file-upload.service.js";
import { MailService } from "../services/notification/mail/mail.service.js";
import { MongodbConnectionService } from "../services/database/mongodb/mongodb-connection.service.js";
import { env } from "../config/env.config.js";
import { Logger } from "../logger.js";

// Global container for the app services
const container = {};

/**
 * Registers services in container.
 * Used for custom dependency injection.
 * @param {Logger} [logger] logger instance
 */
export const registerServices = async (logger) => {
  logger.info("Registering Bcrypt Service");
  container.hashService = new AuthHashService();

  logger.info("Registering JWT Service");
  container.tokenService = new AuthTokenService(env.auth.jwtSecretKey);

  logger.info("Registering Mail Service");
  container.mailService = new MailService(
    env.mail.brevoApiUrl,
    env.mail.brevoApiKey,
    {
      name: env.mail.senderName,
      email: env.mail.senderMailAddress,
    }
  );

  logger.info("Registering File Upload Service");
  container.fileService = new FileUploadService(
    {
      accessKeyId: env.awsS3.accessKeyId,
      secretAccessKey: env.awsS3.secretAccessKey,
    },
    env.awsS3.region,
    env.awsS3.endpoint
  );

  // #region Setting MongoDB Connection
  logger.info("Registering MongoDB Service");

  const mongodbService = new MongodbConnectionService(
    env.mongoDB.host,
    env.mongoDB.database,
    logger
  );

  // Singleton MongoDB Connection
  await mongodbService.connect();

  // Gracefully close MongoDB connection when the app is stopped or crashed
  const mongodbGracefulExit = async () => {
    await mongodbService.closeConnection();
    process.exit(0);
  };

  // Listen for signals to gracefully close the MongoDB connection
  process.on("SIGINT", mongodbGracefulExit); // Interrupt from keyboard (ctrl + c)
  process.on("SIGTERM", mongodbGracefulExit); // Termination signal

  container.mongodbService = mongodbService;
  // #endregion
};

/**
 * Gets a service instance from the container.
 * Creates a new instance and injects it into the container if it doesn't exist.
 * @param {string} serviceName the name of the service
 * @param {function} [ServiceClass] the service class
 * @returns {object} the service instance
 */
export const getService = (serviceName, ServiceClass) => {
  if (!container[serviceName] && ServiceClass)
    // @ts-ignore
    container[serviceName] = new ServiceClass();
  return container[serviceName];
};

// /**
//  * Sets a service instance in the container
//  * @param {string} serviceName service name
//  * @param {object} serviceInstance service instance
//  */
// export const setService = (serviceName, serviceInstance) => {
//   container[serviceName] = serviceInstance;
// };
