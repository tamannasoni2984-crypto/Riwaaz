import crypto from "crypto";
import Order from "../models/orderModel.js";

// CREATE PAYMENT - Initiate PayU payment and return transaction parameters
export const createPayment = async (req, res) => {
  try {
    const {
      orderId,
      amount,
      productinfo,
      firstname,
      email,
      phone,
    } = req.body;

    if (!amount || !firstname || !email || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Payment details are missing",
      });
    }

    // Find RIWAAZ order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Generate PayU transaction ID
    const txnid = "RIWAAZ" + Date.now();

    // Save PayU transaction ID inside order
    order.paymentTransactionId = txnid;
    await order.save();

    // PayU hash
    const hashString =
      `${process.env.PAYU_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${process.env.PAYU_SALT}`;

    const hash = crypto
      .createHash("sha512")
      .update(hashString)
      .digest("hex");

    return res.status(200).json({
      success: true,
      key: process.env.PAYU_KEY,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone,
      hash,
      surl: "http://localhost:5000/api/payment/success",
      furl: "http://localhost:5000/api/payment/failure",
    });
  } catch (error) {
    console.error("Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// VERIFY PAYU RESPONSE - Handle webhook/callback from PayU
export const verifyPayUResponse = async (req, res) => {
  try {
    const {
      status,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      key,
      hash,
      udf1 = "",
      udf2 = "",
      udf3 = "",
      udf4 = "",
      udf5 = "",
    } = req.body;

    // 1. Check required fields
    if (
      !status ||
      !txnid ||
      !amount ||
      !productinfo ||
      !firstname ||
      !email ||
      !key ||
      !hash
    ) {
      return res.status(400).send("Invalid PayU response");
    }

    // 2. Create PayU reverse hash
    const hashString = [
      process.env.PAYU_SALT,
      status,
      "",
      "",
      "",
      "",
      "",
      udf5,
      udf4,
      udf3,
      udf2,
      udf1,
      email,
      firstname,
      productinfo,
      amount,
      txnid,
      key,
    ].join("|");

    const calculatedHash = crypto
      .createHash("sha512")
      .update(hashString)
      .digest("hex");

    // 3. Verify hash
    if (calculatedHash !== hash) {
      return res.status(400).send("Payment verification failed");
    }

    // 4. Find order
    const order = await Order.findOne({
      paymentTransactionId: txnid,
    });

    if (!order) {
      return res.status(404).send("Order not found");
    }

    // 5. Verify amount
    if (Number(order.grandTotal) !== Number(amount)) {
      return res.status(400).send(
        "Payment amount does not match order amount"
      );
    }

    // 6. Successful payment
    if (status === "success") {
      order.paymentStatus = "Paid";
      order.orderStatus = "Processing";

      await order.save();

      return res.redirect(
        `http://localhost:5173/payment-success?orderId=${order._id}`
      );
    }

    // 7. Failed payment
    order.paymentStatus = "Failed";
    await order.save();

    return res.redirect(
      `http://localhost:5173/payment-failure?orderId=${order._id}`
    );
  } catch (error) {
    console.error("PayU Verification Error:", error);

    return res.status(500).send(
      "Payment verification error"
    );
  }
};