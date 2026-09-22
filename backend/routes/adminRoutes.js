import express from "express";
import {
  getAdmins,
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getAdminProfile,
} from "../controller/adminController.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
const router = express.Router();

router.get("/", getAdmins);
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);
router.get("/profile", adminMiddleware, getAdminProfile);

export default router;
