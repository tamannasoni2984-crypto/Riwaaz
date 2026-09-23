import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
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
            street: {
                type: String,
                default: "",
                trim: true,
            },
            city: {
                type: String,
                default: "",
                trim: true,
            },
            state: {
                type: String,
                default: "",
                trim: true,
            },
            pincode: {
                type: String,
                default: "",
                trim: true,
            },
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

        phone: {
            type: String,
            default: "",
            trim: true,
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
    },
    {
        timestamps: true,
    }
);

// Pre-hook: hash password before saving (Mongoose async hook)
userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;