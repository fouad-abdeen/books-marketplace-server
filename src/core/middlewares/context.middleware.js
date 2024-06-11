import morgan from "morgan";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";
import { Context } from "../context.js";
import { Logger } from "../logger.js";
import { env } from "../config/env.config.js";

/**
 * Creates a unique request id and sets the context
 * We also bind here the morgan logger
 */
export class ContextMiddleware {
  _context;
  _logger;

  constructor() {
    this._context = new Context();
    const __filename = fileURLToPath(import.meta.url);
    this._logger = new Logger(__filename);
  }

  use(req, res, next) {
    let requestId = "";

    if (req.headers["request-id"]) {
      // Set the request id to the incoming header
      requestId = req.headers["request-id"];
    } else {
      // Create a new request id and set the header
      requestId = nanoid();
      req.headers["requestId"] = requestId;
    }

    // Set context
    this._context.setContext(req, res, requestId);
    this._logger.setRequestId(requestId);

    // Bind logger
    return morgan(env.log.output, {
      stream: {
        write: this._logger.info.bind(this._logger),
      },
    })(req, res, next);
  }
}
