import compression from "compression";

export class CompressionMiddleware {
  use(req, res, next) {
    return compression()(req, res, next);
  }
}
