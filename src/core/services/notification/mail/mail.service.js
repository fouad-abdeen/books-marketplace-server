import axios from "axios";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { BaseService } from "../../../base.service.js";

export class MailService extends BaseService {
  _brevoApiUrl;
  _brevoApiKey;
  _sender;

  /**
   * @param {string} brevoApiUrl Brevo API URL
   * @param {string} brevoApiKey Brevo API
   * @param {ContactInfo} sender Sender's contact info
   * reference: https://brevo.com/docs/api
   */
  constructor(brevoApiUrl, brevoApiKey, sender) {
    const __filename = fileURLToPath(import.meta.url);
    super(__filename);
    this.brevoApiUrl = brevoApiUrl;
    this.brevoApiKey = brevoApiKey;
    this.sender = sender;
  }

  /**
   * Sends an email to the specified email address.
   * @param {ContactInfo} to recipient name and email address
   * @param {string} subject email subject
   * @param  {string} body email body
   */
  async sendMail(to, subject, body) {
    await axios
      .post(
        this.brevoApiUrl,
        {
          sender: this.sender,
          to: [to],
          subject,
          htmlContent: body,
        },
        { headers: { "api-key": this.brevoApiKey } }
      )
      .then((response) => {
        this._logger.info(
          `Email sent successfully to ${to.name} at ${to.email}!`
        );
        this._logger.info(`Email Message Id: ${response.data.messageId}`);
      })
      .catch((error) => {
        this._logger.error(error.message);
        this._logger.error(JSON.stringify((error.response ?? {}).data));
      });
  }

  /**
   * Parses a mail template with the provided data.
   * @param {mailTemplateType} templateType type of mail template
   * @param {MailTemplateData} data data to be used in the template
   * @returns {string} parsed mail template
   */
  parseMailTemplate(templateType, data) {
    const __filename = fileURLToPath(import.meta.url);
    let template = fs.readFileSync(
      dirname(__filename) + "/templates" + `/${templateType}.html`,
      "utf8"
    );

    data["SENDER_NAME"] = this.sender.name;

    Object.keys(data).forEach((key) => {
      template = template.replace(`{{${key}}}`, data[key]);
    });

    return template;
  }
}

/**
 * @enum {string}
 */
export const mailTemplateType = {
  EMAIL_VERIFICATION: "email-verification",
  PASSWORD_RESET: "password-reset",
};

/**
 * @typedef {Object} MailTemplateData
 * @property {string} USER_NAME - User's name
 * @property {string} CALL_TO_ACTION_URL - URL for the call to action
 * @property {string} [SENDER_NAME] - Sender's name (optional)
 */
/**
 * @typedef {Object} ContactInfo
 * @property {string} name - Contact's name
 * @property {string} email - Contact's email
 */
