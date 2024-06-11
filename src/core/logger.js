import winston from "winston";
import { env } from "../core/config/env.config.js";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "cyan",
  debug: "green",
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: "logs/error.#log",
    level: "error",
  }),
  new winston.transports.File({ filename: "logs/all.#log" }),
];

export const defaultLogger = winston.createLogger({
  level: env.log.level,
  levels,
  format,
  transports,
});

export class Logger {
  static DEFAULT_SCOPE = "app";

  _scope;
  _requestId;

  /**
   * @param {string} [scope] the scope of the logger
   * @param {string} [requestId] the request id
   */
  constructor(scope, requestId) {
    this._scope = scope ?? Logger.DEFAULT_SCOPE;
    this._requestId = requestId;
  }

  debug(message, ...args) {
    this.#log("debug", message, args);
  }

  info(message, ...args) {
    this.#log("info", message, args);
  }

  warn(message, ...args) {
    this.#log("warn", message, args);
  }

  error(message, ...args) {
    this.#log("error", message, args);
  }

  setRequestId(requestId) {
    this._requestId = requestId;
  }

  setScope(scope) {
    this._scope = scope;
  }

  #log(level, message, args) {
    defaultLogger.log(level, `${this.#formatHeader()} ${message}`, args);
  }

  #formatHeader() {
    let header = `${this._scope}`;

    if (this._requestId) {
      header += ` -- Request Id ${this._requestId}:`;
    }
    return header;
  }
}
