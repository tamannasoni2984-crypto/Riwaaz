import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide product name"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Please provide product category"],
      trim: true,
    },
    subCategory: {
      type: String,
      default: "Jewellery",
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Please provide product price"],
      min: [0, "Price cannot be negative"],
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
    image: {
      type: String,
      default: "/images/ring.png",
    },
    isNew: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: "Exquisite handcrafted fine jewelry piece with premium craftsmanship.",
      trim: true,
    },
    stock: {
      type: Number,
      default: 20,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
