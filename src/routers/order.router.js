import { Router } from "express";
import { getService } from "../core/config/container.config.js";
import { OrderController } from "../controllers/order.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { userRole } from "../shared/enums.js";

export class OrderRouter {
  _orderController;

  constructor(app) {
    const router = Router();
    this._orderController = getService("orderController", OrderController);
    this.#configureRoutes(router);
    app.use("/orders", router);
  }

  #configureRoutes(router) {
    const orderRouter = Router();

    /**
     * @swagger
     * /orders:
     *   post:
     *     summary: Place a new order
     *     tags:
     *       - Orders - Customer
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               shippingInfo:
     *                 type: object
     *                 properties:
     *                   firstName:
     *                     type: string
     *                   lastName:
     *                     type: string
     *                   phone:
     *                     type: string
     *                   address:
     *                     type: string
     *     responses:
     *       200:
     *         description: Order placed successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/CreatedOrder'
     *       400:
     *         description: Invalid request
     */
    orderRouter.post(
      "/",
      authMiddleware.authorize({
        roles: [userRole.CUSTOMER],
        disclaimer: "You must be a customer to place an order",
      }),
      this._orderController.placeOrder
    );

    /**
     * @swagger
     * /orders:
     *   get:
     *     summary: Get all orders for the logged-in customer
     *     tags:
     *       - Orders - Customer
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: List of orders
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/BriefOrder'
     *       400:
     *         description: Invalid request
     */
    orderRouter.get(
      "/",
      authMiddleware.authorize({
        roles: [userRole.CUSTOMER],
        disclaimer: "You must be a customer to get your orders",
      }),
      this._orderController.getAllOrders
    );

    /**
     * @swagger
     * /orders/{id}:
     *   get:
     *     summary: Get an order by ID
     *     tags:
     *       - Orders - Customer
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: Order ID
     *     responses:
     *       200:
     *         description: Order details
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Order'
     *       400:
     *         description: Invalid request
     */
    orderRouter.get(
      "/:id",
      authMiddleware.authorize({
        roles: [userRole.CUSTOMER],
        disclaimer: "You must be authorized to view this order",
      }),
      this._orderController.getOrder
    );

    /**
     * @swagger
     * components:
     *   schemas:
     *     CreatedOrder:
     *       type: object
     *       properties:
     *         _id:
     *           type: string
     *         user:
     *           type: string
     *         bookstore:
     *           type: string
     *         shippingInfo:
     *           type: object
     *           properties:
     *             firstName:
     *               type: string
     *             lastName:
     *               type: string
     *             phone:
     *               type: string
     *             address:
     *               type: string
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
     *               totalPrice:
     *                 type: number
     *         subtotal:
     *           type: number
     *         shippingRate:
     *           type: number
     *         total:
     *           type: number
     *         status:
     *           type: string
     *         createdAt:
     *           type: string
     *           format: date-time
     *         updatedAt:
     *           type: string
     *           format: date-time
     *
     *     BriefOrder:
     *       type: object
     *       properties:
     *         user:
     *           type: object
     *           properties:
     *             name:
     *               type: string
     *             email:
     *               type: string
     *         bookstore:
     *           type: object
     *           properties:
     *             _id:
     *               type: string
     *             name:
     *               type: string
     *         total:
     *           type: number
     *         status:
     *           type: string
     *         _id:
     *           type: string
     *
     *     Order:
     *       type: object
     *       properties:
     *         _id:
     *           type: string
     *         user:
     *           type: object
     *           properties:
     *             _id:
     *               type: string
     *             email:
     *               type: string
     *             name:
     *               type: string
     *         bookstore:
     *           type: object
     *           properties:
     *             _id:
     *               type: string
     *             name:
     *               type: string
     *         shippingInfo:
     *           type: object
     *           properties:
     *             firstName:
     *               type: string
     *             lastName:
     *               type: string
     *             phone:
     *               type: string
     *             address:
     *               type: string
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
     *               totalPrice:
     *                 type: number
     *         subtotal:
     *           type: number
     *         shippingRate:
     *           type: number
     *         total:
     *           type: number
     *         status:
     *           type: string
     */
    router.use("/", orderRouter);
  }
}
