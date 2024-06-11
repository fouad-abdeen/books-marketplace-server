import { fileURLToPath } from "url";
import { BaseService } from "../core/base.service.js";
import { getService } from "../core/config/container.config.js";
import { throwError } from "../core/utils/error.js";
import { BookRepository } from "../repositories/book.repository.js";
import { CartRepository } from "../repositories/cart.repository.js";
import { isMongoId, isNumber } from "class-validator";

export class CartService extends BaseService {
  _maxQuantityPerBookPurchase = 20;
  _cartRepository;
  _bookRepository;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    super(__filename);
    this._cartRepository = getService("cartRepository", CartRepository);
    this._bookRepository = getService("bookRepository", BookRepository);
  }

  async addBookToCart(query, bookId, quantity) {
    const cart = await this._cartRepository.getCart(query);

    if (!isMongoId(bookId)) throwError("Invalid book id", 400);
    if (!isNumber(quantity)) throwError("Invalid quantity value", 400);

    let bookInCart = cart.books.find((book) => book.id === bookId);
    if (bookInCart) bookInCart.quantity += quantity;
    else {
      bookInCart = { id: bookId, quantity };
      cart.books.push(bookInCart);
    }

    this.#validateQuantity(bookInCart);
    await this.#validateBookAndStock(bookInCart, cart);

    await this._cartRepository.updateCart(
      { _id: cart._id },
      {
        bookstore: cart.bookstore,
        books: cart.books,
      }
    );

    return await this._cartRepository.getCartWithTotal(query.user);
  }

  async updateBookInCart(query, bookId, quantity) {
    const cart = await this._cartRepository.getCart(query);

    let bookInCart = cart.books.find((book) => book.id === bookId);
    if (!bookInCart) throwError("Book not found in cart", 404);
    bookInCart.quantity = quantity;

    this.#validateQuantity(bookInCart);
    await this.#validateBookAndStock(bookInCart, cart);

    await this._cartRepository.updateCart(
      { _id: cart._id },
      {
        books: cart.books,
      }
    );

    return await this._cartRepository.getCartWithTotal(query.user);
  }

  #validateQuantity(bookInCart) {
    if (bookInCart.quantity < 1)
      throwError("Quantity should be greater than 0", 400);
    if (bookInCart.quantity > this._maxQuantityPerBookPurchase)
      throwError(
        `Quantity should be less than ${this._maxQuantityPerBookPurchase}`,
        400
      );
  }

  async #validateBookAndStock(bookInCart, cart) {
    const bookInDatabase = await this._bookRepository.getBook({
      _id: bookInCart.id,
    });
    if (!bookInDatabase) throwError("Book not found", 404);
    const { availability: isAvailable, stock, bookstore } = bookInDatabase;

    if (!isAvailable) throwError("Book is not available for purchase", 400);
    if (stock < 1) throwError("Book is out of stock", 400);
    if (stock < bookInCart.quantity)
      throwError(`Not enough stock, only ${stock} left`, 400);

    if (cart.books.length === 1) cart.bookstore = bookstore;
    else if (cart.bookstore !== bookstore)
      throwError(
        "You can purchase books from only one bookstore per order",
        400
      );
  }
}
