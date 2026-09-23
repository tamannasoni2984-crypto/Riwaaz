import mongoose from "mongoose";
import Order from "../models/orderModel.js";
import Product from "../models/product.js";

// CREATE NEW ORDER
export const createOrder = async (req, res) => {
  try {
    const {
      customer,
      shippingAddress,
      items,
      itemsTotal,
      tax,
      shippingFee,
      discount,
      promoCode,
      grandTotal,
      paymentMethod,
    } = req.body;

    // Check items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item.",
      });
    }

    // User must be logged in
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login before placing an order.",
      });
    }

    // Generate Order ID
    const orderId =
      "RW-" +
      new Date().getFullYear() +
      "-" +
      Math.floor(1000 + Math.random() * 9000);

    // Create order
    const order = await Order.create({
      orderId,
      user: userId,
      customer: {
        fullName: customer?.fullName || "Valued Customer",
        email: customer?.email || "",
        phone: customer?.phone || "",
      },
      shippingAddress: {
        street: shippingAddress?.street || "",
        city: shippingAddress?.city || "",
        state: shippingAddress?.state || "",
        pincode: shippingAddress?.pincode || "",
      },
      items: items.map((item) => ({
        product: item._id || null,
        name: item.name,
        image: item.image || "/images/ring.png",
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        karat: Array.isArray(item.selectedKarat)
          ? item.selectedKarat[0]
          : Array.isArray(item.karat)
            ? item.karat[0]
            : item.selectedKarat || item.karat || "18K Yellow Gold",
        size: Array.isArray(item.selectedSize)
          ? item.selectedSize[0]
          : Array.isArray(item.size)
            ? item.size[0]
            : item.selectedSize || item.size || "Standard",
      })),
      itemsTotal: Number(itemsTotal) || 0,
      tax: Number(tax) || 0,
      shippingFee: Number(shippingFee) || 0,
      discount: Number(discount) || 0,
      promoCode: promoCode || "",
      grandTotal: Number(grandTotal) || 0,
      paymentMethod: paymentMethod || "cod",
      paymentStatus: paymentMethod === "cod" ? "Cash on Delivery" : "Pending",
      orderStatus: "Pending",
      trackingNumber:
        "RW-TRK-" +
        Math.floor(100000 + Math.random() * 900000),
    });

    // Reduce product stock
    for (const item of items) {
      const productId = item._id;
      if (productId) {
        await Product.findByIdAndUpdate(productId, {
          $inc: {
            stock: -(Number(item.quantity) || 1),
          },
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      data: order,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL ORDERS - ADMIN
export const getAllOrders = async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = {};

    // Filter by order status
    if (status && status !== "All") {
      query.orderStatus = status;
    }

    // Search
    if (search) {
      query.$or = [
        {
          orderId: {
            $regex: search,
            $options: "i",
          },
        },
        {
          "customer.fullName": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "customer.phone": {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const orders = await Order.find(query).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get All Orders Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET USER ORDERS
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    const orders = await Order.find({
      user: userId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get User Orders Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE ORDER
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const isMongoId = mongoose.Types.ObjectId.isValid(id);
    const query = isMongoId
      ? { $or: [{ _id: id }, { orderId: id }] }
      : { orderId: id };

    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const currentUserId = req.user?.id || req.user?._id;
    const currentUserRole = req.user?.role;
    const currentUserEmail = req.user?.email;

    // Admin can view any order
    if (currentUserRole === "admin") {
      return res.status(200).json({
        success: true,
        data: order,
      });
    }

    // Normal user can view their own order
    const isOwnerById = order.user && currentUserId && String(order.user) === String(currentUserId);
    const isOwnerByEmail = order.customer?.email && currentUserEmail && order.customer.email.toLowerCase() === currentUserEmail.toLowerCase();

    if (!isOwnerById && !isOwnerByEmail && order.user) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this order",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get order",
    });
  }
};

// CANCEL ORDER (User / Admin)
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const isMongoId = mongoose.Types.ObjectId.isValid(id);
    const query = isMongoId
      ? { $or: [{ _id: id }, { orderId: id }] }
      : { orderId: id };

    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // Check permissions: Admin can cancel any order, normal user can only cancel their own order
    const currentUserId = req.user?.id || req.user?._id;
    const currentUserRole = req.user?.role;
    const currentUserEmail = req.user?.email;

    const isOwnerById = order.user && currentUserId && String(order.user) === String(currentUserId);
    const isOwnerByEmail = order.customer?.email && currentUserEmail && order.customer.email.toLowerCase() === currentUserEmail.toLowerCase();

    if (currentUserRole !== "admin" && !isOwnerById && !isOwnerByEmail) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this order.",
      });
    }

    // Check status
    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled.",
      });
    }

    if (order.orderStatus === "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Delivered orders cannot be cancelled.",
      });
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = "Cancelled";
    order.cancellationReason =
      cancellationReason ||
      (currentUserRole === "admin"
        ? "Cancelled by Administrator"
        : "Cancelled by Customer");
    order.cancelledBy = currentUserRole === "admin" ? "admin" : "user";
    order.cancelledAt = new Date();

    await order.save();

    // Restore stock if it was not cancelled before
    if (previousStatus !== "Cancelled" && Array.isArray(order.items)) {
      for (const item of order.items) {
        if (item.product) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: Number(item.quantity) || 1 },
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
      data: order,
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel order.",
    });
  }
};

// UPDATE ORDER STATUS - ADMIN
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, cancellationReason } = req.body;
    const { id } = req.params;

    const allowedStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    const isMongoId = mongoose.Types.ObjectId.isValid(id);
    const query = isMongoId
      ? { $or: [{ _id: id }, { orderId: id }] }
      : { orderId: id };

    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = orderStatus;

    if (orderStatus === "Cancelled") {
      order.cancellationReason =
        cancellationReason ||
        order.cancellationReason ||
        "Cancelled by Administrator";
      order.cancelledBy = "admin";
      order.cancelledAt = new Date();

      // Restore stock if transitioning to Cancelled
      if (previousStatus !== "Cancelled" && Array.isArray(order.items)) {
        for (const item of order.items) {
          if (item.product) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: Number(item.quantity) || 1 },
            });
          }
        }
      }
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${orderStatus}`,
      data: order,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};