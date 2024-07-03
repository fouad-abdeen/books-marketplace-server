import { Router } from "express";
import { getService } from "../core/config/container.config.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { bookstoreMiddleware } from "../middlewares/bookstore.middleware.js";
import { uploadedFileMiddleware } from "../middlewares/uploaded-file.middleware.js";
import { BookstoreController } from "../controllers/bookstore.controller.js";
import { BookController } from "../controllers/book.controller.js";
import { GenreController } from "../controllers/genre.controller.js";
import { OrderController } from "../controllers/order.controller.js";
import { userRole } from "../shared/enums.js";

export class BookstoreRouter {
  _bookstoreController;
  _genreController;
  _bookController;
  _orderControllers;

  constructor(app) {
    const router = Router();
    this._bookstoreController = getService(
      "bookstoreController",
      BookstoreController
    );
    this._genreController = getService("genreController", GenreController);
    this._bookController = getService("bookController", BookController);
    this._orderController = getService("orderController", OrderController);
    this.#configureRoutes(router);
    app.use("/bookstores", router);
  }

  #configureRoutes(router) {
    const bookstoreRouter = Router();

    // #region Private Routes
    /**
     * @swagger
     * /bookstores:
     *   post:
     *     summary: Create a new bookstore
     *     tags:
     *       - Bookstores - Bookstore Owner
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/BookstoreUpdate'
     *     responses:
     *       201:
     *         description: Bookstore created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Bookstore'
     */
    bookstoreRouter.post(
      "/",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer: "You must be a bookstore owner to create a bookstore",
      }),
      this._bookstoreController.createBookstore
    );

    /**
     * @swagger
     * /bookstores:
     *   patch:
     *     summary: Update a bookstore
     *     tags:
     *       - Bookstores - Bookstore Owner
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/BookstoreUpdate'
     *     responses:
     *       200:
     *         description: Bookstore updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Bookstore'
     */
    bookstoreRouter.patch(
      "/",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer: "You must be a bookstore owner to update a bookstore",
      }),
      bookstoreMiddleware.checkBookstore(),
      this._bookstoreController.updateBookstore
    );

    /**
     * @swagger
     * /bookstores:
     *   get:
     *     summary: Get the authenticated owner's bookstore
     *     tags:
     *       - Bookstores - Bookstore Owner
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Bookstore retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Bookstore'
     */
    bookstoreRouter.get(
      "/",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer: "You must be a bookstore owner to get your bookstore",
      }),
      bookstoreMiddleware.checkBookstore(true),
      this._bookstoreController.getBookstore
    );

    /**
     * @swagger
     * /bookstores/logo:
     *   post:
     *     summary: Upload a bookstore logo
     *     tags:
     *       - Bookstores - Bookstore Owner
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               file:
     *                 type: string
     *                 format: binary
     *     responses:
     *       200:
     *         description: Logo uploaded successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 key:
     *                   type: string
     *                 url:
     *                   type: string
     */
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

    /**
     * @swagger
     * /bookstores/logo:
     *   delete:
     *     summary: Delete a bookstore logo
     *     tags:
     *       - Bookstores - Bookstore Owner
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Logo deleted successfully
     */
    bookstoreRouter.delete(
      "/logo",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer: "You must be a bookstore owner to delete a bookstore logo",
      }),
      bookstoreMiddleware.checkBookstore(true),
      this._bookstoreController.deleteBookstoreLogo
    );
    // #endregion

    /**
     * @swagger
     * /bookstores/all:
     *   get:
     *     summary: Get all bookstores
     *     tags:
     *       - Bookstores - Admin
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: List of all bookstores
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/BookstoreWithOwner'
     */
    bookstoreRouter.get(
      "/all",
      authMiddleware.authorize({
        roles: [userRole.ADMIN],
        disclaimer: "You must be an admin to get all bookstores",
      }),
      this._bookstoreController.getAllBookstores
    );

    /**
     * @swagger
     * /bookstores/active:
     *   get:
     *     summary: Get all active bookstores
     *     tags:
     *       - Bookstores - Public
     *     responses:
     *       200:
     *         description: List of active bookstores
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/BookstoreWithLogo'
     */
    bookstoreRouter.get(
      "/active",
      this._bookstoreController.getActiveBookstores
    );

    /**
     * @swagger
     * /bookstores/{id}/genres:
     *   get:
     *     summary: Get genres of a bookstore
     *     tags:
     *       - Bookstores - Public
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: The bookstore ID
     *     responses:
     *       200:
     *         description: List of genres
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Genre'
     */
    bookstoreRouter.get("/:id/genres", this._genreController.getAllGenres);

    /**
     * @swagger
     * /bookstores/{id}/books:
     *   get:
     *     summary: Get books of a bookstore
     *     tags:
     *       - Bookstores - Public
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: The bookstore ID
     *       - in: query
     *         name: genre
     *         schema:
     *           type: string
     *         required: false
     *         description: Filter books by genre
     *       - in: query
     *         name: lastDocumentId
     *         schema:
     *           type: string
     *         required: false
     *         description: The ID of the last document from the previous query, for pagination
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *         required: false
     *         description: Maximum number of books to return
     *     responses:
     *       200:
     *         description: List of books
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/BookWithCover'
     */
    bookstoreRouter.get(
      "/:id/books",
      this._bookController.getListOfBookstoreBooks
    );

    //#region Orders' Routes
    /**
     * @swagger
     * /bookstores/orders:
     *   get:
     *     summary: Get all orders for a bookstore
     *     tags:
     *       - Bookstores - Bookstore Owner
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: An array of orders
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/BriefOrder'
     */
    bookstoreRouter.get(
      "/orders",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer:
          "You must be a bookstore owner to get your bookstore orders",
      }),
      bookstoreMiddleware.checkBookstore(),
      this._orderController.getAllOrders
    );

    /**
     * @swagger
     * /bookstores/orders/{id}:
     *   get:
     *     summary: Get a specific order by ID
     *     tags:
     *       - Bookstores - Bookstore Owner
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: The order ID
     *     responses:
     *       200:
     *         description: An order object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Order'
     */
    bookstoreRouter.get(
      "/orders/:id",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer: "You must be authorized to view this order",
      }),
      bookstoreMiddleware.checkBookstore(),
      this._orderController.getOrder
    );

    /**
     * @swagger
     * /bookstores/orders/{orderId}:
     *   patch:
     *     summary: Update an order status
     *     tags:
     *       - Bookstores - Bookstore Owner
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: orderId
     *         schema:
     *           type: string
     *         required: true
     *         description: The order ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               status:
     *                 type: string
     *                 description: The new order status
     *     responses:
     *       200:
     *         description: Order status updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Order'
     */
    bookstoreRouter.patch(
      "/orders/:orderId",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer: "You must be a bookstore owner to update an order status",
      }),
      bookstoreMiddleware.checkBookstore(),
      this._orderController.updateOrderStatus
    );
    // #endregion

    /**
     * @swagger
     * /bookstores/{id}:
     *   get:
     *     summary: Get a bookstore by ID
     *     tags:
     *       - Bookstores - Public
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: The bookstore ID
     *     responses:
     *       200:
     *         description: A bookstore object
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Bookstore'
     *       404:
     *         description: Bookstore not found
     */
    bookstoreRouter.get("/:id", this._bookstoreController.getBookstoreById);

    /**
     * @swagger
     * components:
     *   schemas:
     *     BookstoreWithLogo:
     *       type: object
     *       properties:
     *         _id:
     *           type: string
     *         name:
     *           type: string
     *         description:
     *           type: string
     *         owner:
     *           type: string
     *         phone:
     *           type: string
     *         shippingRate:
     *           type: number
     *         address:
     *           type: string
     *         email:
     *           type: string
     *           nullable: true
     *         logo:
     *           type: object
     *           properties:
     *             _id:
     *               type: string
     *             key:
     *               type: string
     *             url:
     *               type: string
     *           nullable: true
     *         socialMedia:
     *           type: object
     *           properties:
     *             facebook:
     *               type: string
     *               nullable: true
     *             instagram:
     *               type: string
     *               nullable: true
     *             twitter:
     *               type: string
     *               nullable: true
     *             linkedIn:
     *               type: string
     *               nullable: true
     *         isActive:
     *           type: boolean
     *
     *     BookstoreWithOwner:
     *       type: object
     *       properties:
     *         _id:
     *           type: string
     *         name:
     *           type: string
     *         description:
     *           type: string
     *         owner:
     *           type: object
     *           properties:
     *             _id:
     *               type: string
     *             email:
     *               type: string
     *             name:
     *               type: string
     *             isEmailVerified:
     *               type: boolean
     *         phone:
     *           type: string
     *         shippingRate:
     *           type: number
     *         address:
     *           type: string
     *         email:
     *           type: string
     *           nullable: true
     *         logo:
     *           type: object
     *           properties:
     *             _id:
     *               type: string
     *             key:
     *               type: string
     *             url:
     *               type: string
     *           nullable: true
     *         socialMedia:
     *           type: object
     *           properties:
     *             facebook:
     *               type: string
     *               nullable: true
     *             instagram:
     *               type: string
     *               nullable: true
     *             twitter:
     *               type: string
     *               nullable: true
     *             linkedIn:
     *               type: string
     *               nullable: true
     *         isActive:
     *           type: boolean
     *
     *     Bookstore:
     *       type: object
     *       properties:
     *         _id:
     *           type: string
     *         name:
     *           type: string
     *         description:
     *           type: string
     *         owner:
     *           type: string
     *         phone:
     *           type: string
     *         shippingRate:
     *           type: number
     *         address:
     *           type: string
     *         email:
     *           type: string
     *           nullable: true
     *         logo:
     *           type: string
     *           nullable: true
     *         socialMedia:
     *           type: object
     *           properties:
     *             facebook:
     *               type: string
     *               nullable: true
     *             instagram:
     *               type: string
     *               nullable: true
     *             twitter:
     *               type: string
     *               nullable: true
     *             linkedIn:
     *               type: string
     *               nullable: true
     *         isActive:
     *           type: boolean
     *
     *     BookstoreUpdate:
     *       type: object
     *       required:
     *         - name
     *         - description
     *         - phone
     *         - shippingRate
     *         - address
     *         - email
     *         - socialMedia
     *       properties:
     *         name:
     *           type: string
     *         description:
     *           type: string
     *         phone:
     *           type: string
     *           example: "+9613100900"
     *         shippingRate:
     *           type: number
     *           example: 0
     *         address:
     *           type: string
     *         email:
     *           type: string
     *           example: "strin@mg.co"
     *         socialMedia:
     *           type: object
     *           properties:
     *             facebook:
     *               type: string
     *             instagram:
     *               type: string
     *             twitter:
     *               type: string
     *             linkedIn:
     *               type: string
     */
    router.use("/", bookstoreRouter);
  }
}
