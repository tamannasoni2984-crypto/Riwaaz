import Product from "../models/product.js";

// GET all products
export const getProducts = async (req, res) => {
  try {
    const { category, search, sort, isFeatured, isNew } = req.query;
    let query = { isActive: true };

    if (category && category !== "All") {
      query.category = new RegExp(`^${category}$`, "i");
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === "true";
    }

    if (isNew !== undefined) {
      query.isNew = isNew === "true";
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    let productQuery = Product.find(query);

    if (sort === "price-low") {
      productQuery = productQuery.sort({ price: 1 });
    } else if (sort === "price-high") {
      productQuery = productQuery.sort({ price: -1 });
    } else if (sort === "rating") {
      productQuery = productQuery.sort({ rating: -1 });
    } else {
      productQuery = productQuery.sort({ createdAt: -1 });
    }

    const products = await productQuery;

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CREATE new product
export const createProduct = async (req, res) => {
  try {
    const { name, category, subCategory, price, rating, isNew, isFeatured, description, stock } = req.body;

    let image = "/images/ring.png";
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      image = req.body.image;
    }

    const newProduct = await Product.create({
      name,
      category,
      subCategory: subCategory || "Jewellery",
      price: Number(price),
      rating: rating ? Number(rating) : 4.8,
      image,
      isNew: isNew === "true" || isNew === true,
      isFeatured: isFeatured === "true" || isFeatured === true,
      description: description || "Exquisite handcrafted fine jewelry piece with premium craftsmanship.",
      stock: stock ? Number(stock) : 20,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE product
export const updateProduct = async (req, res) => {
  try {
    let updateData = { ...req.body };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
