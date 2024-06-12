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

    orderRouter.post(
      "/",
      authMiddleware.authorize({
        roles: [userRole.CUSTOMER],
        disclaimer: "You must be a customer to place an order",
      }),
      this._orderController.placeOrder
    );

    orderRouter.get(
      "/",
      authMiddleware.authorize({
        roles: [userRole.CUSTOMER],
        disclaimer: "You must be a customer to get your orders",
      }),
      this._orderController.getAllOrders
    );

    orderRouter.get(
      "/:id",
      authMiddleware.authorize({
        roles: [userRole.CUSTOMER],
        disclaimer: "You must be authorized to view this order",
      }),
      this._orderController.getOrder
    );

    router.use("/", orderRouter);
  }
}
