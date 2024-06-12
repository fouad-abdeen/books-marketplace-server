import { fileURLToPath } from "url";
import { isMongoId, isNumber } from "class-validator";
import { BaseService } from "../core/base.service.js";
import { Context } from "../core/context.js";
import { getService } from "../core/config/container.config.js";
import { throwError } from "../core/utils/error.js";
import { UserService } from "./user.service.js";
import { OrderRepository } from "../repositories/order.repository.js";
import { CartRepository } from "../repositories/cart.repository.js";
import { BookRepository } from "../repositories/book.repository.js";
import { BookstoreRepository } from "../repositories/bookstore.repository.js";
import { orderStatus } from "../shared/enums.js";

export class OrderService extends BaseService {
  _userService;
  _orderRepository;
  _cartRepository;
  _bookRepository;
  _bookstoreRepository;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    super(__filename);
    this._userService = getService("userService", UserService);
    this._orderRepository = getService("orderRepository", OrderRepository);
    this._cartRepository = getService("cartRepository", CartRepository);
    this._bookRepository = getService("bookRepository", BookRepository);
    this._bookstoreRepository = getService(
      "bookstoreRepository",
      BookstoreRepository
    );
  }

  async placeOrder(shippingInfo) {
    const { _id, customerInfo } = Context.getUser();
    this.#validateCustomerInfo(shippingInfo ?? customerInfo);

    // Get the user's cart with books information
    const cart = await this._cartRepository.getCartWithTotal(_id);
    if (!cart.books.length) throwError("Your cart is empty", 400);

    // Re-validate stock and calculate total price
    await this.#validateStockAndCalculateTotal(cart.books);

    const bookstore = await this._bookstoreRepository.getBookstore({
      _id: cart.bookstore,
    });

    const order = {
      user: _id,
      bookstore: cart.bookstore,
      shippingInfo: shippingInfo ?? customerInfo,
      books: cart.books,
      subtotal: cart.total,
      shippingRate: bookstore.shippingRate,
      total: cart.total + bookstore.shippingRate,
      status: orderStatus.PENDING,
    };

    const placedOrder = await this._orderRepository.createOrder(order);

    // Clear the user's cart after placing the order
    await this._cartRepository.updateCart(
      { user: _id },
      { bookstore: null, books: [] }
    );

    return placedOrder;
  }

  async updateOrderStatus(query, status) {
    if (!Object.values(orderStatus).includes(status)) {
      throwError("Invalid order status", 400);
    }
    return await this._orderRepository.updateOrder(query, { status });
  }

  #validateCustomerInfo(customerInfo) {
    if (!customerInfo)
      throwError(
        "Customer shipping information is required to place an order",
        400
      );
    this._userService.validateCustomerInfo(customerInfo);
  }

  async #validateStockAndCalculateTotal(books) {
    for (const book of books) {
      const { id, quantity } = book;

      if (!isMongoId(id.toString())) throwError("Invalid book id", 400);
      if (!isNumber(quantity)) throwError("Invalid quantity value", 400);

      const bookInDatabase = await this._bookRepository.getBook({
        _id: id,
      });
      if (!bookInDatabase) throwError("Book not found", 404);

      const { availability: isAvailable, stock, price } = bookInDatabase;

      if (!isAvailable)
        throwError(`Book '${book.title}' is not available for purchase`, 400);
      if (stock < 1) throwError(`Book '${book.title}' is out of stock`, 400);
      if (stock < book.quantity)
        throwError(
          `Not enough stock for '${book.title}', only ${stock} left`,
          400
        );

      // Ensure the book price is up-to-date
      book.price = price;
      book.totalPrice = price * book.quantity;
    }
  }
}
