import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

import {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from "../controller/orderController.js";

const router = express.Router();

// USER: create order
router.post("/", authMiddleware, createOrder);

// ADMIN: get all orders
router.get("/", adminMiddleware, getAllOrders);

// USER: get own orders
router.get("/my-orders", authMiddleware, getUserOrders);

// USER / ADMIN: cancel order with reason
router.put("/:id/cancel", authMiddleware, cancelOrder);

// USER: get order by ID
router.get("/:id", authMiddleware, getOrderById);

// ADMIN: update order status
router.put("/:id/status", adminMiddleware, updateOrderStatus);

export default router;