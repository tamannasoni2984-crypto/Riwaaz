import express from "express";
import { createPayment, verifyPayUResponse } from "../controller/paymentController.js";

const router = express.Router();

router.post("/create", createPayment);
router.post("/success", verifyPayUResponse);
router.post("/failure", verifyPayUResponse);

export default router;