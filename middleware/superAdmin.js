import user from '../models/user.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose/index.js';

export const verifySuperAdmin = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "").trimLeft();
        const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userData = await user.findById(verified.id);

        if (!userData) {
            return res.status(403).send("SuperAdmin Access Denied 1");
        }

        if (!mongoose.Types.ObjectId.isValid(userData.id)) {
            return res.status(404).send("SuperAdmin Access Denied 2");
        }

        if (userData.accountRole[1] !== "superAdmin") {

            return res.status(403).send("SuperAdmin Access Denied 3");

        }

        next();

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
