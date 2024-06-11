import { Context } from "../core/context.js";
import { throwError } from "../core/utils/error.js";
import { getService } from "../core/config/container.config.js";
import { BookstoreRepository } from "../repositories/bookstore.repository.js";

class BookstoreMiddleware {
  _bookstoreRepository;

  constructor() {}

  checkBookstore(setBookstore = false) {
    if (!this._bookstoreRepository)
      this._bookstoreRepository = getService(
        "bookstoreRepository",
        BookstoreRepository
      );

    return async (req, res, next) => {
      try {
        const owner = Context.getUser()._id.toString();
        const bookstore = await this._bookstoreRepository.getBookstore({
          owner,
        });

        if (!bookstore)
          throwError(
            "You don't have a registered bookstore. Please register your bookstore first",
            400
          );

        if (!bookstore.isActive)
          throwError(
            "Your bookstore is not active. Please contact us for more information",
            400
          );

        req.bookstoreId = bookstore._id.toString();
        if (setBookstore) req.bookstore = bookstore;
        next();
      } catch (error) {
        next(error);
      }
    };
  }
}

export const bookstoreMiddleware = new BookstoreMiddleware();
