import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    try {
        const token =
            req.cookies?.token ||
            (req.headers?.authorization && req.headers.authorization.startsWith("Bearer ")
                ? req.headers.authorization.split(" ")[1]
                : null);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Please login first",
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "riwaaz_secret_key_123"
        );

        // Any valid logged-in user is allowed
        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

export default authMiddleware;