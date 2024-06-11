import { Context } from "./context.js";
import { Logger } from "./logger.js";

/*
 * Base Service Class.
 * Exposes the logger to any service that extends it.
 */
export class BaseService {
  _logger;

  /**
   * @param {string} filename filename of the service
   * @param {Logger} [logger] logger instance
   */
  constructor(filename, logger) {
    this._logger = logger ?? new Logger(filename);
  }

  setRequestId() {
    this._logger.setRequestId(Context.getRequestId());
  }
}
