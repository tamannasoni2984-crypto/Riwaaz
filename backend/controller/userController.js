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
    const { username, fullname, email, password, address, profileimage } = req.body;

    if (!username || !fullname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide username, fullname, email, and password",
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists",
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
      username,
      fullname,
      email,
      password, // Password will be automatically hashed by userSchema.pre('save')
      address: address || "",
      profileimage: imagePath,
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: userResponse,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// LOGIN user
// export const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }
//     if (password !== user.password) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid password",
//       });
//     }
//     const token = jwt.sign(
//       {
//         id: user._id,
//         email: user.email,
//         role: "user",
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "1min",
//       }
//     );
//   }
//   catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // console.log("Login body:", req.body);
    // console.log("Login email:", email);

    console.log("REQ BODY:", req.body);
    console.log("EMAIL:", req.body.email);
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: "user",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1min",
      }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: {
        id: user._id,
        email: user.email,
        role: "user",
      },
    });
  }
  catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// LOGOUT user
export const logoutUser = (req, res) => {
  res.clearCookie("token");

  res.json({
    success: true,
    message: "Lgout successfull"
  });
};
// keep the rest for now
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
