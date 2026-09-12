import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import cookieParser from "cookie-parser";
import connectDB from "./db/db.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
})
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static("uploads"));
app.use("/images", express.static("images"));
connectDB();
app.get("/", (req, res) => {
  res.send("RIWAAZ Backend is running!");
});

// Database connection check middleware
app.use((req, res, next) => {
  if (req.path.startsWith("/api") && mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database connection unavailable. Please whitelist your current IP address in MongoDB Atlas (Network Access -> Add IP -> 0.0.0.0/0).",
    });
  }
  next();
});

// API Routes
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});