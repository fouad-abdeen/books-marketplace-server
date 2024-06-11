/**
 * Throws custom error with message and httpCode
 * @param {string} message error message
 * @param {number} httpCode error http code
 */
export const throwError = (message, httpCode) => {
  const error = new Error(message);
  // @ts-ignore
  error.httpCode = httpCode;
  throw error;
};
