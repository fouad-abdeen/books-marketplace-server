import express from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export class AuthRouter {
  _authController;

  constructor(app) {
    const router = express.Router();
    this._authController = new AuthController();
    // /**
    //  * @swagger
    //  * components:
    //  *   securitySchemes:
    //  *     BearerAuth:
    //  *       type: http
    //  *       scheme: bearer
    //  *       bearerFormat: JWT
    //  */
    this.#configureRoutes(router);
    app.use("/auth", router);
  }

  #configureRoutes(router) {
    const authRouter = express.Router();
    /**
     * @swagger
     * /auth/signup:
     *   post:
     *     tags:
     *       - Auth
     *     summary: Sign up a new user
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *               - name
     *               - role
     *             properties:
     *               email:
     *                 type: string
     *                 description: The user's email
     *               password:
     *                 type: string
     *                 description: The user's password
     *               name:
     *                 type: string
     *                 description: The user's name
     *               role:
     *                 type: string
     *                 description: The user's role
     *     responses:
     *       201:
     *         description: Successfully created
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     */
    authRouter.post("/signup", this._authController.signup);

    /**
     * @swagger
     * /auth/login:
     *   post:
     *     tags:
     *       - Auth
     *     summary: Log in a user
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 description: The user's email
     *               password:
     *                 type: string
     *                 description: The user's password
     *     responses:
     *       200:
     *         description: Successfully logged in
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     */
    authRouter.post("/login", this._authController.login);

    /**
     * @swagger
     * /auth/logout:
     *   get:
     *     tags:
     *       - Auth
     *     summary: Log out a user
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: Successfully logged out
     */
    authRouter.get(
      "/logout",
      authMiddleware.authorize(),
      this._authController.logout
    );

    /**
     * @swagger
     * /auth/email/verify:
     *   put:
     *     tags:
     *       - Auth
     *     summary: Verify a user's email
     *     parameters:
     *       - in: query
     *         name: token
     *         description: The email verification token
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Email successfully verified
     */
    authRouter.put("/email/verify", this._authController.verifyEmail);

    /**
     * @swagger
     * /auth/password:
     *   get:
     *     tags:
     *       - Auth
     *     summary: Request a password reset link
     *     parameters:
     *       - in: query
     *         name: email
     *         description: The email to send the password reset link to
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Password reset link sent successfully
     */
    authRouter.get("/password", this._authController.requestPasswordReset);

    /**
     * @swagger
     * /auth/password:
     *   post:
     *     tags:
     *       - Auth
     *     summary: Reset a user's password
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - token
     *               - password
     *             properties:
     *               token:
     *                 type: string
     *                 description: The password reset token
     *               password:
     *                 type: string
     *                 description: The new password
     *     responses:
     *       200:
     *         description: Password reset successfully
     */
    authRouter.post("/password", this._authController.resetPassword);

    /**
     * @swagger
     * /auth/password:
     *   put:
     *     tags:
     *       - Auth
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
    authRouter.put(
      "/password",
      authMiddleware.authorize(),
      this._authController.updatePassword
    );

    /**
     * @swagger
     * /auth/user:
     *   get:
     *     tags:
     *       - Auth
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
    authRouter.get(
      "/user",
      authMiddleware.authorize(),
      this._authController.getAuthenticatedUser
    );

    router.use("/", authRouter);
  }
}
