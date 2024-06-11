import { fileURLToPath } from "url";
import { BaseService } from "../core/base.service.js";
import { Context } from "../core/context.js";
import { getService } from "../core/config/container.config.js";
import { CartService } from "../services/cart.service.js";
import { CartRepository } from "../repositories/cart.repository.js";

export class CartController extends BaseService {
  _cartService;
  _cartRepository;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    super(__filename);
    this._cartService = getService("cartService", CartService);
    this._cartRepository = getService("cartRepository", CartRepository);
    this.addBookToCart = this.addBookToCart.bind(this);
    this.updateBookInCart = this.updateBookInCart.bind(this);
    this.removeBookFromCart = this.removeBookFromCart.bind(this);
    this.clearCart = this.clearCart.bind(this);
    this.getCart = this.getCart.bind(this);
  }

  async addBookToCart(req, res, next) {
    try {
      this.setRequestId();
      this._logger.info("Received a request to add a book to the cart");
      const user = Context.getUser()._id;
      const updatedCart = await this._cartService.addBookToCart(
        {
          user,
        },
        req.body.bookId,
        req.body.quantity
      );
      res.status(200).json(updatedCart);
    } catch (error) {
      next(error);
    }
  }

  async updateBookInCart(req, res, next) {
    try {
      this.setRequestId();
      this._logger.info("Received a request to update a book in the cart");
      const user = Context.getUser()._id;
      const updatedCart = await this._cartService.updateBookInCart(
        {
          user,
        },
        req.params.bookId,
        req.body.quantity
      );
      res.status(200).json(updatedCart);
    } catch (error) {
      next(error);
    }
  }

  async removeBookFromCart(req, res, next) {
    try {
      this.setRequestId();
      this._logger.info("Received a request to remove a book from the cart");
      const user = Context.getUser()._id;
      const updatedCart = await this._cartRepository.updateCart(
        { user },
        { $pull: { books: { id: req.params.bookId } } }
      );
      res.status(200).json(updatedCart);
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req, res, next) {
    try {
      this.setRequestId();
      this._logger.info("Received a request to clear the cart");
      const updatedCart = await this._cartRepository.updateCart(
        { user: Context.getUser()._id },
        {
          bookstore: null,
          books: [],
        }
      );
      res.status(200).json(updatedCart);
    } catch (error) {
      next(error);
    }
  }

  async getCart(req, res, next) {
    try {
      this.setRequestId();
      this._logger.info("Received a request to get the cart");
      const cart = await this._cartRepository.getCartWithTotal(
        Context.getUser()._id
      );
      res.status(200).json(cart);
    } catch (error) {
      next(error);
    }
  }
}
