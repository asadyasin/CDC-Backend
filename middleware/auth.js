import jwt from 'jsonwebtoken';

export const verifyToken = async (req, res, next) => {
    try {

        let token = req.header("Authorization");
        
        if (!token) {
            return res.status(403).send("Authorization Access Denied 1");
        }
        

        if (token.startsWith("Bearer ")) {

            token = token.slice(7, token.length).trimLeft();
        
        }
        
        const verifed = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        req.user = verifed;

        next();

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};