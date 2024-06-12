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

    /**
     * @swagger
     * /cart:
     *   get:
     *     tags:
     *       - Cart - Customer
     *     summary: Get the current user's cart
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: Cart retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Cart'
     */
    cartRouter.get(
      "/",
      authMiddleware.authorize({
        roles: [userRole.CUSTOMER],
        disclaimer: "You must be a customer to get your cart",
      }),
      this._cartController.getCart
    );

    /**
     * @swagger
     * /cart:
     *   patch:
     *     tags:
     *       - Cart - Customer
     *     summary: Clear the current user's cart
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: Cart cleared successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Cart'
     */
    cartRouter.patch(
      "/",
      authMiddleware.authorize({
        roles: [userRole.CUSTOMER],
        disclaimer: "You must be a customer to clear your cart",
      }),
      this._cartController.clearCart
    );

    /**
     * @swagger
     * /cart/books:
     *   post:
     *     tags:
     *       - Cart - Customer
     *     summary: Add a book to the current user's cart
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               bookId:
     *                 type: string
     *               quantity:
     *                 type: integer
     *     responses:
     *       200:
     *         description: Book added to cart successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Cart'
     */
    cartRouter.post(
      "/books",
      authMiddleware.authorize({
        roles: [userRole.CUSTOMER],
        disclaimer: "You must be a customer to add a book to the cart",
      }),
      this._cartController.addBookToCart
    );

    /**
     * @swagger
     * /cart/books/{bookId}:
     *   patch:
     *     tags:
     *       - Cart - Customer
     *     summary: Update a book in the current user's cart
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: bookId
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               quantity:
     *                 type: integer
     *     responses:
     *       200:
     *         description: Book updated in cart successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Cart'
     */
    cartRouter.patch(
      "/books/:bookId",
      authMiddleware.authorize({
        roles: [userRole.CUSTOMER],
        disclaimer: "You must be a customer to update a book in the cart",
      }),
      this._cartController.updateBookInCart
    );

    /**
     * @swagger
     * /cart/books/{bookId}:
     *   delete:
     *     tags:
     *       - Cart - Customer
     *     summary: Remove a book from the current user's cart
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: bookId
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Book removed from cart successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Cart'
     */
    cartRouter.delete(
      "/books/:bookId",
      authMiddleware.authorize({
        roles: [userRole.CUSTOMER],
        disclaimer: "You must be a customer to remove a book from the cart",
      }),
      this._cartController.removeBookFromCart
    );

    /**
     * @swagger
     * components:
     *   schemas:
     *     Cart:
     *       type: object
     *       properties:
     *         user:
     *           type: string
     *         bookstore:
     *           type: string
     *           nullable: true
     *         books:
     *           type: array
     *           items:
     *             type: object
     *             properties:
     *               id:
     *                 type: string
     *               quantity:
     *                 type: integer
     *               title:
     *                 type: string
     *               cover:
     *                 type: string
     *                 nullable: true
     *               price:
     *                 type: number
     *         total:
     *           type: number
     */
    router.use("/", cartRouter);
  }
}
