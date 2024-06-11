import express from "express";
import { getService } from "../core/config/container.config.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { bookstoreMiddleware } from "../middlewares/bookstore.middleware.js";
import { GenreController } from "../controllers/genre.controller.js";
import { userRole } from "../shared/enums.js";

export class GenreRouter {
  _genreController;

  constructor(app) {
    const router = express.Router();
    this._genreController = getService("genreController", GenreController);
    this.#configureRoutes(router);
    app.use("/genres", router);
  }

  #configureRoutes(router) {
    const genreRouter = express.Router();

    genreRouter.post(
      "/",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer: "You must be a bookstore owner to create a genre",
      }),
      bookstoreMiddleware.checkBookstore(),
      this._genreController.createGenre
    );

    genreRouter.patch(
      "/:id",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer: "You must be a bookstore owner to update a genre",
      }),
      bookstoreMiddleware.checkBookstore(),
      this._genreController.updateGenre
    );

    genreRouter.delete(
      "/:id",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer: "You must be a bookstore owner to delete a genre",
      }),
      bookstoreMiddleware.checkBookstore(),
      this._genreController.deleteGenre
    );

    router.use("/", genreRouter);
  }
}
