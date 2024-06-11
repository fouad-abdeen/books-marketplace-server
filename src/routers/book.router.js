import express from "express";
import { getService } from "../core/config/container.config.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { bookstoreMiddleware } from "../middlewares/bookstore.middleware.js";
import { BookController } from "../controllers/book.controller.js";
import { BookArchiveController } from "../controllers/book-archive.controller.js";
import { userRole } from "../shared/enums.js";
import { uploadedFileMiddleware } from "../middlewares/uploaded-file.middleware.js";

export class BookRouter {
  _bookController;
  _bookArchiveController;

  constructor(app) {
    const router = express.Router();
    this._bookController = getService("bookController", BookController);
    this._bookArchiveController = getService(
      "bookArchiveController",
      BookArchiveController
    );
    this.#configureRoutes(router);
    app.use("/books", router);
  }

  #configureRoutes(router) {
    const bookRouter = express.Router();

    bookRouter.post(
      "/",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer: "You must be a bookstore owner to create a book",
      }),
      bookstoreMiddleware.checkBookstore(),
      this._bookController.createBook
    );

    bookRouter.post(
      "/:id/cover",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer: "You must be a bookstore owner to create a book",
      }),
      bookstoreMiddleware.checkBookstore(),
      uploadedFileMiddleware.parseFile(),
      this._bookController.uploadBookCover
    );

    bookRouter.delete(
      "/:id/cover",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer: "You must be a bookstore owner to delete a book cover",
      }),
      bookstoreMiddleware.checkBookstore(),
      this._bookController.deleteBookCover
    );

    bookRouter.patch(
      "/:id",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer: "You must be a bookstore owner to update a book",
      }),
      bookstoreMiddleware.checkBookstore(),
      this._bookController.updateBook
    );

    bookRouter.delete(
      "/:id",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer: "You must be a bookstore owner to delete a book",
      }),
      bookstoreMiddleware.checkBookstore(),
      this._bookController.deleteBook
    );

    bookRouter.get(
      "/:id/archives",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer: "You must be a bookstore owner to view book archives",
      }),
      bookstoreMiddleware.checkBookstore(),
      this._bookArchiveController.getBookArchives
    );

    bookRouter.get("/:id", this._bookController.getBookById);

    router.use("/", bookRouter);
  }
}
