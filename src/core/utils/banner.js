import { Logger } from "../logger.js";
import { env } from "../config/env.config.js";

/**
 * Displays the banner with the application information
 * @param {Logger} log logger instance
 */
export function displayBanner(log) {
  log.info("-------------------------------------------------------");
  log.info(`The app is ready on ${env.app.url}`);
  log.info(`To shut it down, press <CTRL> + C at any time.`);
  log.info(``);
  log.info("-------------------------------------------------------");
  log.info(`Service      : ${env.app.name}`);
  log.info(`Environment  : ${env.nodeEnv}`);
  log.info(`Version      : ${env.app.version}`);
  log.info(``);
  log.info(`Health API   : ${env.app.url}/health`);
  log.info(`Docs API     : ${env.app.url}/docs`);
  log.info("-------------------------------------------------------\n");
}
