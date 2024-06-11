import { Router } from "express";
import { getService } from "../core/config/container.config.js";
import { CartController } from "../controllers/cart.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { userRole } from "../shared/enums.js";

export class CartRouter {
  _cartController;

  constructor(app) {
    const router = Router();
    this._cartController = getService("cartController", CartController);
    this.#configureRoutes(router);
    app.use("/cart", router);
  }

  #configureRoutes(router) {
    const cartRouter = Router();

    cartRouter.get(
      "/",
      authMiddleware.authorize({
        roles: [userRole.CUSTOMER],
        disclaimer: "You must be a customer to get your cart",
      }),
      this._cartController.getCart
    );

    cartRouter.patch(
      "/",
      authMiddleware.authorize({
        roles: [userRole.CUSTOMER],
        disclaimer: "You must be a customer to clear your cart",
      }),
      this._cartController.clearCart
    );

    cartRouter.post(
      "/books",
      authMiddleware.authorize({
        roles: [userRole.CUSTOMER],
        disclaimer: "You must be a customer to add a book to the cart",
      }),
      this._cartController.addBookToCart
    );

    cartRouter.patch(
      "/books/:bookId",
      authMiddleware.authorize({
        roles: [userRole.CUSTOMER],
        disclaimer: "You must be a customer to update a book in the cart",
      }),
      this._cartController.updateBookInCart
    );

    cartRouter.delete(
      "/books/:bookId",
      authMiddleware.authorize({
        roles: [userRole.CUSTOMER],
        disclaimer: "You must be a customer to remove a book from the cart",
      }),

      this._cartController.removeBookFromCart
    );

    router.use("/", cartRouter);
  }
}
