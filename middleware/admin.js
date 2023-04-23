import jwt from 'jsonwebtoken';
import mongoose from 'mongoose/index.js';
import user from '../models/user.js';

export const verifyAdmin = async (req, res, next) => {
    try {

        let token = req.header("Authorization");

        if (token.startsWith("Bearer ")) {

            token = token.slice(7, token.length).trimLeft();
        
        }

        const verifed = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        const userData = await user.findById(verifed.id);

        if (!userData.id) {

            return res.status(403).send("Access Denied 1");
        
        }
        
        if(!mongoose.Types.ObjectId.isValid(userData.id))return res.status(404).send('Access Denied 2');
        
        
        if (userData.accountRole[1] !== "admin" && userData.accountRole[1] !== "superAdmin"){

            return res.status(403).send("SuperAdmin Access Denied 3");
            
        }

        next();

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};