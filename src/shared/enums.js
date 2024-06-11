export { mailTemplateType } from "../core/services/notification/mail/mail.service.js";

/**
 * @enum {string}
 */
export const userRole = {
  ADMIN: "admin",
  BOOKSTORE_OWNER: "bookstore_owner",
  CUSTOMER: "customer",
};

/**
 * @enum {string}
 */
export const authTokenType = {
  ACCESS_TOKEN: "Access Token",
  REFRESH_TOKEN: "Refresh Token",
  EMAIL_VERIFICATION_TOKEN: "Email Verification Token",
  PASSWORD_RESET_TOKEN: "Password Reset Token",
};
