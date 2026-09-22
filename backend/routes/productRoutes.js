import express from "express";

import {
  getProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
} from "../controller/productController.js";

import upload from "../middleware/uploadMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/:id", getProductById);

// Logged-in user
router.post("/:id/review", authMiddleware, addProductReview);

// Admin only
router.post(
  "/",
  adminMiddleware,
  upload.single("image"),
  createProduct
);

router.put(
  "/:id",
  adminMiddleware,
  upload.single("image"),
  updateProduct
);

router.delete(
  "/:id",
  adminMiddleware,
  deleteProduct
);

export default router;