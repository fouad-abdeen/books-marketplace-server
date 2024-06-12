import { Router } from "express";
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
    const router = Router();
    this._bookController = getService("bookController", BookController);
    this._bookArchiveController = getService(
      "bookArchiveController",
      BookArchiveController
    );
    this.#configureRoutes(router);
    app.use("/books", router);
  }

  #configureRoutes(router) {
    const bookRouter = Router();

    /**
     * @swagger
     * /books:
     *   post:
     *     tags:
     *       - Books - Bookstore Owner
     *     summary: Create a new book
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/BookUpdate'
     *     responses:
     *       201:
     *         description: Book created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Book'
     */
    bookRouter.post(
      "/",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer: "You must be a bookstore owner to create a book",
      }),
      bookstoreMiddleware.checkBookstore(),
      this._bookController.createBook
    );

    /**
     * @swagger
     * /books/{id}/cover:
     *   post:
     *     tags:
     *       - Books - Bookstore Owner
     *     summary: Upload a book cover
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: The book ID
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
     *         description: Book cover uploaded successfully
     */
    bookRouter.post(
      "/:id/cover",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer: "You must be a bookstore owner to upload a book cover",
      }),
      bookstoreMiddleware.checkBookstore(),
      uploadedFileMiddleware.parseFile(),
      this._bookController.uploadBookCover
    );

    /**
     * @swagger
     * /books/{id}/cover:
     *   delete:
     *     tags:
     *       - Books - Bookstore Owner
     *     summary: Delete a book cover
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: The book ID
     *     responses:
     *       204:
     *         description: Book cover deleted successfully
     */
    bookRouter.delete(
      "/:id/cover",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer: "You must be a bookstore owner to delete a book cover",
      }),
      bookstoreMiddleware.checkBookstore(),
      this._bookController.deleteBookCover
    );

    /**
     * @swagger
     * /books/{id}:
     *   patch:
     *     tags:
     *       - Books - Bookstore Owner
     *     summary: Update a book
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: The book ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/BookUpdate'
     *     responses:
     *       200:
     *         description: Book updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Book'
     */
    bookRouter.patch(
      "/:id",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer: "You must be a bookstore owner to update a book",
      }),
      bookstoreMiddleware.checkBookstore(),
      this._bookController.updateBook
    );

    /**
     * @swagger
     * /books/{id}:
     *   delete:
     *     tags:
     *       - Books - Bookstore Owner
     *     summary: Delete a book
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: The book ID
     *     responses:
     *       204:
     *         description: Book deleted successfully
     */
    bookRouter.delete(
      "/:id",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer: "You must be a bookstore owner to delete a book",
      }),
      bookstoreMiddleware.checkBookstore(),
      this._bookController.deleteBook
    );

    /**
     * @swagger
     * /books/{id}/archives:
     *   get:
     *     tags:
     *       - Books - Bookstore Owner
     *     summary: Get book archives
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: The book ID
     *     responses:
     *       200:
     *         description: Book archives retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/BookArchive'
     */
    bookRouter.get(
      "/:id/archives",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer: "You must be a bookstore owner to view book archives",
      }),
      bookstoreMiddleware.checkBookstore(),
      this._bookArchiveController.getBookArchives
    );

    /**
     * @swagger
     * /books/{id}:
     *   get:
     *     tags:
     *       - Books - Public
     *     summary: Get a book by ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: The book ID
     *     responses:
     *       200:
     *         description: Book retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Book'
     */
    bookRouter.get("/:id", this._bookController.getBookById);

    /**
     * @swagger
     * components:
     *   schemas:
     *     BookArchive:
     *       type: object
     *       properties:
     *         _id:
     *           type: string
     *         bookstore:
     *           type: string
     *         book:
     *           type: string
     *         title:
     *           type: string
     *         description:
     *           type: string
     *         author:
     *           type: string
     *         genre:
     *           type: string
     *         price:
     *           type: number
     *         availability:
     *           type: boolean
     *         stock:
     *           type: integer
     *         publisher:
     *           type: string
     *         publicationYear:
     *           type: integer
     *         createdAt:
     *           type: string
     *           format: date-time
     *     BookUpdate:
     *       type: object
     *       properties:
     *         title:
     *           type: string
     *         description:
     *           type: string
     *         author:
     *           type: string
     *         genre:
     *           type: string
     *         price:
     *           type: number
     *         availability:
     *           type: boolean
     *         stock:
     *           type: integer
     *         publisher:
     *           type: string
     *         publicationYear:
     *           type: integer
     *     Book:
     *       type: object
     *       properties:
     *         publisher:
     *           type: string
     *         cover:
     *           type: string
     *           nullable: true
     *         publicationYear:
     *           type: integer
     *         _id:
     *           type: string
     *         createdAt:
     *           type: string
     *           format: date-time
     *         updatedAt:
     *           type: string
     *           format: date-time
     *
     *     BookWithCover:
     *       type: object
     *       properties:
     *         bookstore:
     *           type: string
     *         title:
     *           type: string
     *         description:
     *           type: string
     *         author:
     *           type: string
     *         genre:
     *           type: string
     *         price:
     *           type: number
     *         availability:
     *           type: boolean
     *         stock:
     *           type: number
     *         publisher:
     *           type: string
     *           nullable: true
     *         cover:
     *           type: object
     *           properties:
     *             _id:
     *               type: string
     *             key:
     *               type: string
     *             url:
     *               type: string
     *           nullable: true
     *         publicationYear:
     *           type: number
     *           nullable: true
     */
    router.use("/", bookRouter);
  }
}
