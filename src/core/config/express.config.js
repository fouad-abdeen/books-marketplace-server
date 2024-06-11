import express from "express";
import { createServer } from "http";
import * as httpContext from "express-http-context";
import cors from "cors";
import cookieParser from "cookie-parser";
import {
  serve as serveSwaggerUi,
  setup as setupSwaggerUi,
} from "swagger-ui-express";
import { env } from "./env.config.js";
import { registerServices } from "./container.config.js";
import { specs } from "./swagger.config.js";
import { ResponseInterceptor } from "../interceptors/response.interceptor.js";
import { CompressionMiddleware } from "../middlewares/compression.middleware.js";
import { ContextMiddleware } from "../middlewares/context.middleware.js";
import { ErrorHandlerMiddleware } from "../middlewares/error-handler.middleware.js";
import { SecurityMiddleware } from "../middlewares/security.middleware.js";
import routers from "../../routers/index.js";

/**
 * Express server class
 * Configures express server, registers services, and sets up routes
 */
export class Express {
  _app;
  _server;
  _authService;

  constructor(logger) {
    this._app = express();
    this._server = createServer(this._app);

    registerServices(logger).then(() => {
      this.configHealthRoute();
      this.configExpress();
    });
  }

  configExpress() {
    this._server.listen(env.app.port);

    this._app.use(httpContext.middleware);
    this._app.use(
      cors({
        origin: env.frontend.url,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type"],
        exposedHeaders: ["Set-Cookie"],
        credentials: true,
      })
    );
    this._app.use(cookieParser());

    this._app.use(new SecurityMiddleware().use);
    this._app.use(new CompressionMiddleware().use);
    this._app.use(express.urlencoded({ extended: true }));
    this._app.use(express.json());

    this._app.use("/docs", serveSwaggerUi, setupSwaggerUi(specs));

    const contextMiddleware = new ContextMiddleware();
    this._app.use(contextMiddleware.use.bind(contextMiddleware));

    const responseInterceptor = new ResponseInterceptor();
    this._app.use((req, res, next) => {
      const oldJson = res.json;
      // Overriding the default `json` method of the response object.
      // This allows us to intercept the data before it is sent as a JSON response.
      // The `responseInterceptor.intercept` function is called with the data,
      // and its return value is used as the new data.
      // The original `json` method is then called with the new data.
      // The new `json` method intercepts the data before sending it as a JSON response
      res.json = function (data) {
        arguments[0] = responseInterceptor.intercept(data);
        return oldJson.apply(res, arguments);
      };
      next();
    });

    for (const Router of routers) {
      new Router(this._app);
    }

    const errorHandlerMiddleware = new ErrorHandlerMiddleware();
    this._app.use((err, req, res, next) =>
      errorHandlerMiddleware.handle(err, req, res, next)
    );
  }

  configHealthRoute() {
    this._app.get("/health", (req, res) => {
      res.json({
        name: env.app.name,
        version: env.app.version,
        description: env.app.description,
      });
    });
  }
}
