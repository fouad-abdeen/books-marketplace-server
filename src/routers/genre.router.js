import { Router } from "express";
import { getService } from "../core/config/container.config.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { bookstoreMiddleware } from "../middlewares/bookstore.middleware.js";
import { GenreController } from "../controllers/genre.controller.js";
import { userRole } from "../shared/enums.js";

export class GenreRouter {
  _genreController;

  constructor(app) {
    const router = Router();
    this._genreController = getService("genreController", GenreController);
    this.#configureRoutes(router);
    app.use("/genres", router);
  }

  #configureRoutes(router) {
    const genreRouter = Router();

    /**
     * @swagger
     * /genres:
     *   post:
     *     summary: Create a new genre
     *     tags:
     *       - Genres -  Bookstore Owner
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *     responses:
     *       201:
     *         description: The genre was successfully created
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Genre'
     */
    genreRouter.post(
      "/",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer: "You must be a bookstore owner to create a genre",
      }),
      bookstoreMiddleware.checkBookstore(),
      this._genreController.createGenre
    );

    /**
     * @swagger
     * /genres/{id}:
     *   patch:
     *     summary: Update a genre
     *     deprecated: True
     *     tags:
     *       - Genres -  Bookstore Owner
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: The genre id
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *     responses:
     *       200:
     *         description: The genre was successfully updated
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Genre'
     */
    genreRouter.patch(
      "/:id",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer: "You must be a bookstore owner to update a genre",
      }),
      bookstoreMiddleware.checkBookstore(),
      this._genreController.updateGenre
    );

    /**
     * @swagger
     * /genres/{id}:
     *   delete:
     *     summary: Delete a genre
     *     tags:
     *       - Genres -  Bookstore Owner
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: The genre id
     *     responses:
     *       200:
     *         description: The genre was successfully deleted
     */
    genreRouter.delete(
      "/:id",
      authMiddleware.authorize({
        roles: [userRole.BOOKSTORE_OWNER],
        disclaimer: "You must be a bookstore owner to delete a genre",
      }),
      bookstoreMiddleware.checkBookstore(),
      this._genreController.deleteGenre
    );

    /**
     * @swagger
     * components:
     *   schemas:
     *     Genre:
     *       type: object
     *       properties:
     *         bookstore:
     *           type: string
     *         name:
     *           type: string
     *         _id:
     *           type: string
     *         createdAt:
     *           type: string
     *           format: date-time
     *         updatedAt:
     *           type: string
     *           format: date-time
     */
    router.use("/", genreRouter);
  }
}
