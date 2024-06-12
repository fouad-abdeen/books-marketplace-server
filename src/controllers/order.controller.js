import { fileURLToPath } from "url";
import { BaseService } from "../core/base.service.js";
import { Context } from "../core/context.js";
import { getService } from "../core/config/container.config.js";
import { OrderService } from "../services/order.service.js";
import { OrderRepository } from "../repositories/order.repository.js";

export class OrderController extends BaseService {
  _orderService;
  _orderRepository;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    super(__filename);
    this._orderService = getService("orderService", OrderService);
    this._orderRepository = getService("orderRepository", OrderRepository);
    this.placeOrder = this.placeOrder.bind(this);
    this.getOrder = this.getOrder.bind(this);
    this.getAllOrders = this.getAllOrders.bind(this);
    this.updateOrderStatus = this.updateOrderStatus.bind(this);
  }

  async placeOrder(req, res, next) {
    try {
      this.setRequestId();
      const user = Context.getUser()._id;
      const { shippingInfo } = req.body;
      const order = await this._orderService.placeOrder(shippingInfo);
      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  }

  async getOrder(req, res, next) {
    try {
      this.setRequestId();
      const user = Context.getUser()._id;
      const order = await this._orderRepository.getOrder({
        _id: req.params.id,
        $or: [{ user }, { bookstore: req.bookstoreId }],
      });
      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  }

  async getAllOrders(req, res, next) {
    try {
      this.setRequestId();
      const user = Context.getUser()._id;
      const orders = await this._orderRepository.getListOfOrders({
        $or: [{ user }, { bookstore: req.bookstoreId }],
      });
      res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req, res, next) {
    try {
      this.setRequestId();
      const { orderId } = req.params;
      const { status } = req.body;
      const order = await this._orderService.updateOrderStatus(
        { _id: orderId, bookstore: req.bookstoreId },
        status
      );
      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  }
}
