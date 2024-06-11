// @ts-nocheck
import * as httpContext from "express-http-context";

/**
 * Context is a class used to save the main parameters used throughout a request (requestId, logged in user, etc.)
 */
export class Context {
  /**
   * Sets the context for a request
   * @param {Request} req express request object
   * @param {Response} res express response object
   * @param {string} requestId request id
   */
  setContext(req, res, requestId) {
    httpContext.ns.bindEmitter(req);
    httpContext.ns.bindEmitter(res);
    httpContext.set(CONTEXT_VALUES.REQUEST_ID, requestId);
  }

  /**
   *
   * @static
   * @param {User} user the user object that will be set in http context
   * @memberof Context
   */
  static setUser(user) {
    httpContext.set(CONTEXT_VALUES.USER, user);
  }

  /**
   *
   * @static
   * @returns {User} the user which is present in http context
   * @memberof Context
   */
  static getUser() {
    return httpContext.get(CONTEXT_VALUES.USER);
  }

  /**
   *
   * @static
   * @returns {string} the request id which is present in http context
   * @memberof Context
   */
  static getRequestId() {
    return httpContext.get(CONTEXT_VALUES.REQUEST_ID);
  }
}

/**
 * @enum {string}
 */
const CONTEXT_VALUES = {
  REQUEST_ID: "request-id",
  USER: "user",
};
