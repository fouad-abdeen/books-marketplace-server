import express from "express";
import { getService } from "../core/config/container.config.js";
import { UserController } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { userRole } from "../shared/enums.js";

export class UserRouter {
  _userController;

  constructor(app) {
    const router = express.Router();
    this._userController = getService("userController", UserController);
    this.#configureRoutes(router);

    /**
     * @swagger
     * components:
     *   schemas:
     *     User:
     *       type: object
     *       properties:
     *         _id:
     *           type: string
     *           description: The user's id
     *         email:
     *           type: string
     *           description: The user's email
     *         name:
     *           type: string
     *           description: The user's name
     *         role:
     *           type: string
     *           enum: ["admin", "bookstore_owner", "customer"]
     *           description: The user's role
     *         isEmailVerified:
     *           type: boolean
     *           description: Whether the user's email is verified
     *         customerInfo:
     *           type: object
     *           properties:
     *             firstName:
     *               type: string
     *               description: The customer's first name
     *             lastName:
     *               type: string
     *               description: The customer's last name
     *             phone:
     *               type: string
     *               description: The customer's phone number
     *             address:
     *               type: string
     *               description: The customer's address
     */
    app.use("/users", router);
  }

  #configureRoutes(router) {
    const userRouter = express.Router();

    /**
     * @swagger
     * /users:
     *   get:
     *     tags:
     *       - User
     *     summary: Get authenticated user's info
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: User info
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     */
    userRouter.get(
      "/",
      authMiddleware.authorize(),
      this._userController.getAuthenticatedUser
    );

    /**
     * @swagger
     * /users/password:
     *   patch:
     *     tags:
     *       - User
     *     summary:  Update a user's password
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - currentPassword
     *               - newPassword
     *             properties:
     *               currentPassword:
     *                 type: string
     *                 description: The current password
     *               newPassword:
     *                 type: string
     *                 description: The new password
     *               terminateAllSessions:
     *                 type: boolean
     *                 description: Whether to terminate all sessions
     *     responses:
     *       200:
     *         description: Password updated successfully
     */
    userRouter.patch(
      "/password",
      authMiddleware.authorize(),
      this._userController.updatePassword
    );

    /**
     * @swagger
     * /users/customer-info:
     *   patch:
     *     tags:
     *       - User
     *     summary: Update a customer's information
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - firstName
     *               - lastName
     *               - phone
     *               - address
     *             properties:
     *               firstName:
     *                 type: string
     *                 description: The customer's first name
     *               lastName:
     *                 type: string
     *                 description: The customer's last name
     *               phone:
     *                 type: string
     *                 description: The customer's phone number
     *               address:
     *                 type: string
     *                 description: The customer's address
     *     responses:
     *       200:
     *         description: Customer information updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     */
    userRouter.patch(
      "/customer-info",
      authMiddleware.authorize({
        roles: [userRole.CUSTOMER],
        disclaimer: "You must be a customer to update your information",
      }),
      this._userController.updateCustomerInfo
    );

    router.use("/", userRouter);
  }
}
