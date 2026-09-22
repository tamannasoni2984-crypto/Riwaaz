import jwt from "jsonwebtoken";

const adminMiddleware = (req, res, next) => {
    try {
        const token =
            req.cookies?.token ||
            (req.headers?.authorization && req.headers.authorization.startsWith("Bearer ")
                ? req.headers.authorization.split(" ")[1]
                : null);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Please login as admin first",
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "riwaaz_secret_key_123"
        );

        if (decoded.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required.",
            });
        }

        req.admin = decoded;
        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

export default adminMiddleware;