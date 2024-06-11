import { env } from "../config/env.config.js";
import { fileURLToPath } from "url";
import { Logger } from "../logger.js";

/**
 * Catches all errors, logs them, and formats the responses
 */
export class ErrorHandlerMiddleware {
  _isProduction;
  _logger;

  constructor() {
    this._isProduction = env.nodeEnv === "production";
    const __filename = fileURLToPath(import.meta.url);
    this._logger = new Logger(__filename);
  }

  handle(error, req, res, next) {
    // Set requestId of logger to keep track of request
    this.#setLogger(req);

    if (res.headersSent) return;

    const isValidationError =
      error.message.split("check 'errors' property").length > 1;

    // Set class-validator error message
    if (isValidationError)
      error.message =
        Object.values(error["errors"][0]["constraints"])[0] || error.message;

    res.setHeader("Access-Control-Allow-Origin", env.frontend.url);

    res.status(error.httpCode || 500).json(
      new ErrorResponse({
        name: error.name,
        message: error.message,
      })
    );

    // Log error
    if (this._isProduction) {
      this._logger.error(`Error Name: ${error["name"]}`);
      this._logger.error(`Error Message: ${error["message"]}`);
    } else {
      this._logger.error(`Error Name: ${error["name"]}`);
      if (isValidationError)
        this._logger.error(`Class Validator Errors: ${error["message"]}`);
      this._logger.error(`Error Stack: ${error["stack"]}`);
    }
  }

  /**
   * Resets the request of the logger.
   * Context is lost after an exception. That's why we keep the requestId as part of the express request as well.
   * @param req express request
   */
  #setLogger(req) {
    const requestId = req.headers["requestId"]
      ? req.headers["requestId"].toString()
      : "";

    this._logger.setRequestId(requestId);
  }
}

/**
 * Error Response
 */
class ErrorResponse {
  status;
  error;

  constructor(error) {
    this.status = "error";
    this.error = error;
  }
}
