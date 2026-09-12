import jwt from "jsonwebtoken";

const adminMiddleware = (req, res, next) => {
    try {
        // 1. Get token from cookie
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Please login first",
            });
        }

        // 2. Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // 3. Check admin role
        if (decoded.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin only.",
            });
        }

        // 4. Save admin information
        req.admin = decoded;

        // 5. Continue to the next middleware/controller
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

export default adminMiddleware;