import express from "express";

import upload from "../middleware/uploadMiddleware.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

import {
  getUsers,
  registerUser,
  loginUser,
  logoutUser,
  updateUserProfile,
  deleteUser,
} from "../controller/userController.js";

const router = express.Router();

// Logged-in user
router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "You are authenticated",
    user: req.user,
  });
});

// Logged-in user can update own profile
router.put("/profile", authMiddleware, updateUserProfile);

// Admin only
router.get("/", adminMiddleware, getUsers);

// Public registration
router.post(
  "/register",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "profileimage", maxCount: 1 },
  ]),
  registerUser
);

// Public login
router.post("/login", loginUser);

// Logout
router.post("/logout", logoutUser);

// Admin only
router.delete("/:id", adminMiddleware, deleteUser);

export default router;