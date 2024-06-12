import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env.config.js";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Souk el Kotob API",
      version: "1.0.0",
      description:
        "An API for Souk el Kotob, an online bookstores marketplace.",
    },
    servers: [
      {
        url: `${env.app.url}`,
      },
    ],
  },
  apis: ["./src/routers/*.js"],
};

export const specs = swaggerJsdoc(options);
