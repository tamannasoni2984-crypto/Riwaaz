import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";
// import { loginUser } from "../controller/userController.js";

import {
  getUsers,
  registerUser,
  loginUser,
  logoutUser,
  deleteUser,
} from "../controller/userController.js";

const router = express.Router();

router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "You are authenticated",
    user: req.user,
  });
});
router.get("/", getUsers);
router.get("/test-upload", (req, res) => {
  res.send(`
    <h1>Upload Product Image </h1>

    <form action="/api/products/test-upload" method="Post" enctype="multipart/form-data">
    <input type="text" name="name" placeholder="Product Name" />
    <br><br>

    <input type="number" name="price" placeholder="Product price "/>
    <br><br>

    <input type="file" name="image" />
    <br><br>

    <button type="submit">Submit</button>

    </form>
    `);
});
router.post("/test-upload", upload.single("image"),
  (req, res) => {
    console.log("Body", req.body);
    console.log("File", req.file);
    res.json({
      message: "Product uploaded successfully",
      file: req.file
    });
  }
);
router.post(
  "/register",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "profileimage", maxCount: 1 },
  ]),
  registerUser
);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.delete("/:id", deleteUser);

export default router;
