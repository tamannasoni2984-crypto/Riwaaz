import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: false,
    },

    name: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "/images/ring.png",
    },

    price: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      default: 1,
    },

    karat: {
      type: String,
      default: "18K Yellow Gold",
    },

    size: {
      type: String,
      default: "Standard",
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      required: true,
    },

    paymentTransactionId: {
      type: String,
      default: null,
    },

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Paid",
        "Failed",
        "Cash on Delivery",
      ],
      default: "Pending",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    customer: {
      fullName: {
        type: String,
        required: true,
      },

      email: {
        type: String,
        default: "",
      },

      phone: {
        type: String,
        required: true,
      },
    },

    shippingAddress: {
      street: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        required: true,
      },

      pincode: {
        type: String,
        required: true,
      },
    },

    items: [orderItemSchema],

    itemsTotal: {
      type: Number,
      required: true,
    },

    tax: {
      type: Number,
      default: 0,
    },

    shippingFee: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    promoCode: {
      type: String,
      default: "",
    },

    grandTotal: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Cash on Delivery"],
      default: "Pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    trackingNumber: {
      type: String,
      default: "",
    },

    cancellationReason: {
      type: String,
      default: "",
    },

    cancelledBy: {
      type: String,
      enum: ["user", "admin", ""],
      default: "",
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;