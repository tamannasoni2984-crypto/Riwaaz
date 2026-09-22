import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: { type: String, required: true, default: "Valued Connoisseur" },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

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
    images: {
      type: [String],
      default: [],
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
    karat: {
      type: [String],
      default: ["18K Yellow Gold", "22K Royal Gold", "950 Platinum", "18K Rose Gold"],
    },
    sizes: {
      type: [String],
      default: ["12 (Standard)", "14", "16", "18", "Free Size"],
    },
    metal: {
      type: String,
      default: "18K Hallmarked Gold",
    },
    diamondClarity: {
      type: String,
      default: "VVS1 / EF Color",
    },
    reviews: [reviewSchema],
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

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
