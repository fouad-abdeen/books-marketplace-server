import { Express } from "./express.config.js";
import { Logger } from "../logger.js";
import { displayBanner } from "../utils/banner.js";

/**
 * Main application class.
 * Creates the express server, launches it , and displays the banner.
 */
export class Application {
  express;

  constructor() {
    const logger = new Logger("App");
    logger.info("Starting...");
    this.express = new Express(logger);
    displayBanner(logger);
  }
}
