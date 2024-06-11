import { Router } from "express";
import { getService } from "../core/config/container.config.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { bookstoreMiddleware } from "../middlewares/bookstore.middleware.js";
import { BookstoreController } from "../controllers/bookstore.controller.js";
import { BookController } from "../controllers/book.controller.js";
import { GenreController } from "../controllers/genre.controller.js";
import { userRole } from "../shared/enums.js";
import { uploadedFileMiddleware } from "../middlewares/uploaded-file.middleware.js";

export class BookstoreRouter {
  _bookstoreController;
  _bookController;
  _genreController;

  constructor(app) {
    const router = Router();
    this._bookstoreController = getService(
      "bookstoreController",
      BookstoreController
    );
    this._bookController = getService("bookController", BookController);
    this._genreController = getService("genreController", GenreController);
    this.#configureRoutes(router);
    app.use("/bookstores", router);
  }

  #configureRoutes(router) {
    const bookstoreRouter = Router();

    bookstoreRouter.post(
      "/",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer: "You must be a bookstore owner to create a bookstore",
      }),
      this._bookstoreController.createBookstore
    );

    bookstoreRouter.patch(
      "/",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer: "You must be a bookstore owner to update a bookstore",
      }),
      bookstoreMiddleware.checkBookstore(),
      this._bookstoreController.updateBookstore
    );

    bookstoreRouter.get(
      "/",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer: "You must be a bookstore owner to get your bookstore",
      }),
      bookstoreMiddleware.checkBookstore(true),
      this._bookstoreController.getBookstore
    );

    bookstoreRouter.post(
      "/logo",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer: "You must be a bookstore owner to upload a bookstore logo",
      }),
      bookstoreMiddleware.checkBookstore(true),
      uploadedFileMiddleware.parseFile(),
      this._bookstoreController.uploadBookstoreLogo
    );

    bookstoreRouter.delete(
      "/logo",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer: "You must be a bookstore owner to delete a bookstore logo",
      }),
      bookstoreMiddleware.checkBookstore(true),
      this._bookstoreController.deleteBookstoreLogo
    );

    bookstoreRouter.get(
      "/all",
      authMiddleware.authorize({
        roles: [userRole.ADMIN],
        disclaimer: "You must be an admin to get all bookstores",
      }),
      this._bookstoreController.getAllBookstores
    );

    bookstoreRouter.get(
      "/active",
      this._bookstoreController.getActiveBookstores
    );

    bookstoreRouter.get(
      "/:id/books",
      this._bookController.getListOfBookstoreBooks
    );

    bookstoreRouter.get(
      "/:id/genres",
      this._genreController.getBookstoreGenres
    );

    bookstoreRouter.get("/:id", this._bookstoreController.getBookstoreById);

    router.use("/", bookstoreRouter);
  }
}
