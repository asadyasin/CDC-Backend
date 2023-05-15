import jwt from 'jsonwebtoken';

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "").trimLeft();

        if (!token) {
            return res.status(403).send("Authorization Access Denied 1");
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = verified;

        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};