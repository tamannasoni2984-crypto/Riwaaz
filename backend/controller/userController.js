import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// GET all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select("-password");
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// REGISTER user
export const registerUser = async (req, res) => {
  try {
    const { username, fullname, email, password, address, profileimage, phone } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide full name, email, and password.",
      });
    }

    const cleanUsername = username || email.split("@")[0] + "_" + Math.floor(Math.random() * 1000);

    const existingUser = await User.findOne({ $or: [{ email }, { username: cleanUsername }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists.",
      });
    }

    let imagePath = profileimage || "";
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    } else if (req.files) {
      const fileObj = req.files.image?.[0] || req.files.profileimage?.[0];
      if (fileObj) {
        imagePath = `/uploads/${fileObj.filename}`;
      }
    }

    const user = await User.create({
      username: cleanUsername,
      fullname,
      email,
      password,
      phone,
      address: {
        street: address?.street || "",
        city: address?.city || "",
        state: address?.state || "",
        pincode: address?.pincode || "",
      },
      profileimage: imagePath,
    });

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: "user",
      },
      process.env.JWT_SECRET || "riwaaz_secret_key_123",
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userResponse = {
      id: user._id,
      name: user.fullname,
      email: user.email,
      username: user.username,
      phone: phone || "+91 98765 43210",
      profileimage: user.profileimage,
      memberStatus: "Silver Privilege Member",
      joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    };

    res.status(201).json({
      success: true,
      message: "Account created successfully! Welcome to RIWAAZ.",
      user: userResponse,
      token,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// LOGIN user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter both email and password.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid password. Please verify your credentials.",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: "user",
      },
      process.env.JWT_SECRET || "riwaaz_secret_key_123",
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userResponse = {
      id: user._id,
      name: user.fullname,
      email: user.email,
      username: user.username,
      phone: user.phone || "",
      address: user.address || {},
      profileimage: user.profileimage,
      memberStatus: "Gold VIP Member",
      joinedDate: user.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : "January 2026",
    };

    res.status(200).json({
      success: true,
      message: "Welcome back to RIWAAZ!",
      user: userResponse,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const userId = req.user?.id || req.user?._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (name) user.fullname = name;
    if (phone !== undefined) user.phone = phone;
    if (address) user.address = address;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      user: {
        id: user._id,
        name: user.fullname,
        email: user.email,
        username: user.username,
        phone: user.phone || "",
        address: user.address,
        profileimage: user.profileimage,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// LOGOUT user
export const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

// DELETE user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
