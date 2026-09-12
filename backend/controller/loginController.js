export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        if (password !== user.password) {
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
                expiresIn: "1m",
            }
        );
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.mesage,
        });
    }
};