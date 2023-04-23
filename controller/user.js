import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose/index.js';
import User from '../models/user.js';
import userVerification from '../models/userVerification.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    } 
});

// transporter.verify((error, success)=>{
//      if(error){
//         console.log(error);
//      }else{
//         console.log("Ready for message")
//         console.log(success);
//      }
// })

/* Get All Users */

export const getUser  = async (req, res)=>{
    try {
        const userData = await User.find({}, { _id: 1, username: 1, email: 1, accountRole: 1, createdAt: 1});
        
        res.status(200).json(userData);

    } catch (error) {
        res.status(404).json({message: error.message});
    }
}

/* Sign in with email password */

export const signin = async (req, res) => {

    const { email, password } = req.body;

    try {

        const existingUser = await User.findOne({ email: email });
        
        
        if (!existingUser)return res.status(404).json({ message: "User does not exist"});

        if (existingUser.verified){
            
            const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

            if(!isPasswordCorrect)return res.status(400).json({ message: "Invalid Credentials"});

            const token = jwt.sign({email: existingUser.email, id: existingUser._id}, process.env.JWT_SECRET_KEY , { });

            const result = {
                username: existingUser.username,
                email: existingUser.email,
                accountRole: existingUser.accountRole,
                id: existingUser._id
            }

            res.status(200).json({result , token});

        }else{
            res.status(400).json({message: "Email hasn't been verified yet check your inbox"});
        }
        
    } catch (error) {
        res.status(500).json({error});
    }
};

/* Signup with All info */

export const signup = async (req, res) => {

    const {username, email, password, confirmPassword} = req.body;

    try {
        
        const existingUser = await User.findOne({ email });

        if (existingUser)return res.status(400).json({ message: "User already exists"});

        if(password === confirmPassword){

            const hashedPassword = await bcrypt.hash(password, 12);
            
            const result = await User.create({email, password: hashedPassword, username, verified: false});

            sendVerificationEmail(result, res);
            
        }else{
        
            return res.status(400).json({ message: "Passwords doesn't match"});
        
        }
    
    } catch (error) {
        res.status(500).json({message: error.message});
    }

};

/*Send Verification Email*/

const sendVerificationEmail = async ({_id, email}, res) => {

    const currentUrl = `${process.env.HOST}${process.env.PORT}`;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const file = path.join(__dirname,"/../views/verificationEmail.html")
    let html = fs.readFileSync(file, "utf8");
    let link = `${currentUrl +"/user/verify/"+_id}`

    html = html.replace('{link1}', link);
    html = html.replace('{link2}', link);

    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Verify Your Email",
        html: html,
    }
    const newVerification = new userVerification({
            userId: _id,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000,
        });
    try {
        await newVerification.save();
        try {
            await transporter.sendMail(mailOptions);
                res.status(200).json({
                    Status: "PENDING",
                    message :"Verification Email Sent Successfully"
                });
        } catch (error) {
            await User.deleteOne({ _id });
            res.status(500).json({message: error.message});    
        }
    } catch (error) {
        await User.deleteOne({ _id });
        res.status(500).json({message: error.message});
    }
}

/* Verify Emails */
export const verifyEmail = async (req, res)=>{
    const { userId } = req.params;
    try {

        const verificationData = await userVerification.findOne({userId});
        
        if (!verificationData){
            let message = "Account record doesn't exist or has been verified already. Please sign up or log in.";
            res.redirect(`/user/verified/?error=true&message=${message}`); 
        }else{
            
            const expriesAt = verificationData.expiresAt;
            
            if(expriesAt < Date.now()){
                try {
                    await userVerification.deleteOne({ userId });
                        try {
                            await User.deleteOne({ _id: userId });
                            let message = "Link has been expired. Please sign up again.";
                            res.redirect(`/user/verified/?error=true&message=${message}`);
                        } catch (error) {
                            let message = "Error during clearing User with expried time failed.";
                            res.redirect(`/user/verified/?error=true&message=${message}`);
                        }
                } catch (error) {
                    let message = "An error occurred clearing the expires user verification record.";
                    res.redirect(`/user/verified/?error=true&message=${message}`);
                }
            }else{
                    try {
                            await User.updateOne({_id: userId},{verified : true});
                            try {
                                await userVerification.deleteOne({userId});
                                res.redirect(`/user/verified`);
                            } catch (error) {
                                let message = "An error ocured while deleting the user verified.";
                                res.redirect(`/user/verified/?error=true&message=${message}`);
                            }
                        } catch (error) {
                            let message = "An error ocured while updating the user verified.";
                            res.redirect(`/user/verified/?error=true&message=${message}`);
                        }
                } 
            }
            
    } catch (error) {
        console.log(error);
        let message = "An error occurred while checking existing user verification record";
        res.redirect(`/user/verified/?error=true&message=${message}`);
    }
};

/*Verify Html file Route*/

export const verified = async (req, res)=> {
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    res.sendFile(path.join(__dirname,"/../views/verified.html"));
}

/* Update User Role or Profile */

export const updateUser = async (req,res)=>{

    const user = req.body;
    const _id = user.id;
    try {
        
        if(!mongoose.Types.ObjectId.isValid(_id))return res.status(404).send('No user with that id');
        
        const result = await User.findByIdAndUpdate(_id,{ ...user , _id }, { new : true });
        
        res.status(200).json("User updated successfully");
        
    } catch (error) {
        res.status(500).json({message: error.message});
    }
    
}

/* Delete User By Its id only SuperAdmin */

export const deleteUser = async (req,res)=>{

    const { id: _id } = req.params;
    
    if(!mongoose.Types.ObjectId.isValid(_id)){return res.status(404).send('No User with that id')};
    
    await User.findByIdAndRemove(_id);
    
    res.status(200).json({message: 'User deleted successfully'})
}

/* Password Reset only login user */

export const resetPassword = async (req, res) => {
    
    const {email, oldPassword, newPassword, confirmPassword} = req.body;
    
    try {

        let token = req.header("Authorization");

        if (token.startsWith("Bearer ")) {

            token = token.slice(7, token.length).trimLeft();
        
        }

        const verifed = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        const userData = await User.findById(verifed.id);

        const isPasswordCorrect = await bcrypt.compare(oldPassword, userData.password);
        
        if(!isPasswordCorrect)return res.status(400).json({ message: "Invalid Credentials"});
        
        if(newPassword === confirmPassword){

            userData.password = await bcrypt.hash(newPassword, 12);

            await userData.save();

            res.status(200).json("Password Reset Successfully");
            
        }else{
        
            return res.status(400).json({ message: "Passwords doesn't match"});
        
        }
        
    } catch (error) {
        res.status(500).json({message: error.message});    
    }

}