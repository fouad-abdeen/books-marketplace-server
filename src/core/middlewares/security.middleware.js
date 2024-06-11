import helmet from "helmet";

/**
 * Adds security middleware (more about helmet here: https://helmetjs.github.io/)
 */
export class SecurityMiddleware {
  use(req, res, next) {
    return helmet()(req, res, next);
  }
}
