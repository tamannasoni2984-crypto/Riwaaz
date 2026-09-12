import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        fullname: {
            type: String,
            required: true,
            trim: true,
        },

        profileimage: {
            type: String,
            default: "",
        },

        address: {
            type: String,
            default: "",
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        deleteat: {
            type: Date,
            default: null,
        },

        createdby: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            default: null,
        },
        role: {
            type: String,
            enum: ["admin"],
            default: "admin",
        }
    },
    {
        timestamps: true,
    }
);

// Pre-hook: hash password before saving (Mongoose async hook)
adminSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;