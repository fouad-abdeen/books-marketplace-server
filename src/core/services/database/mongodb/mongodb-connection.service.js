import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { BaseService } from "../../../base.service.js";

export class MongodbConnectionService extends BaseService {
  _connection;
  _dbHost;
  _dbName;

  /**
   * Check out Connection String URI Format (DB_HOST):
   * https://docs.mongodb.com/manual/reference/connection-string/
   * @param dbHost Connection string URI, including MongoDB cluster/server host
   * @param dbName Database name, will be appended to dbHost
   * @param logger Optional: logger to use for logging
   */
  constructor(dbHost, dbName, logger) {
    const __filename = fileURLToPath(import.meta.url);
    super(__filename, logger);
    this._dbHost = dbHost;
    this._dbName = dbName;
  }

  /**
   * Establishes a connection to the database.
   * To use at the launch of the app.
   */
  async connect() {
    try {
      await mongoose.connect(this._dbHost + this._dbName);
      this._connection = mongoose.connection;
      this._logger.info("Connected to MongoDB");
    } catch (error) {
      this._logger.error(
        "An error has occurred while connecting to MongoDB",
        error
      );
      throw new Error(error.message || "Error connecting to MongoDB");
    }
  }

  /**
   * Creates a mongoose model from a class.
   * @param {string} collectionName Name of the collection.
   * @param {mongoose.Schema} schema Mongoose Schema.
   * @returns {mongoose.Model} Mongoose Model.
   **/
  getModel(collectionName, schema) {
    this.dbConnectionCheck();
    return mongoose.model(collectionName, schema);
  }

  /**
   * Closes the current connection created when initializing the service.
   */
  async closeConnection() {
    await mongoose.connection.close();
    this._connection = {};
    this._logger.info("Disconnected from MongoDB");
  }

  /**
   * Creates a new collection inside the database.
   * @param {string} name Collection name that will be created.
   * @param {boolean} [deletePrevious] If set to true, then deletes any existing collection that has the same name. Otherwise, this function safely succeeds.
   */
  async createCollection(name, deletePrevious) {
    this.dbConnectionCheck();

    if (deletePrevious) {
      this._logger.info(
        `Dropping collection ${name} from ${this._connection.db.databaseName}`
      );
      await this._connection.dropCollection(name);
    }

    this._logger.info(
      `Creating collection ${name} in ${this._connection.db.databaseName}`
    );
    await this._connection.createCollection(name);
  }

  dbConnectionCheck() {
    if (this._connection) if (this._connection.db) return;
    this._logger.error("MongoDB connection does not exist");
    throw new Error("Error connecting to MongoDB");
  }
}
