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
      const existingUser = await User.findOne({ email });
  
      if (!existingUser) {
        return res.status(404).json({ message: "User does not exist" });
      }
  
      if (!existingUser.verified) {
        return res.status(400).json({ message: "Email hasn't been verified yet. Check your inbox" });
      }
  
      const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
  
      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
  
      const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, process.env.JWT_SECRET_KEY, {});
  
      const { username, accountRole, _id: id } = existingUser;
  
      const result = { username, email, accountRole, id };
      
      res.status(200).json({ result, token });
    } catch (error) {
      res.status(500).json({ error });
    }
  };

/* Signup with All info */

export const signup = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords don't match" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Prepare user object without creating it yet
    const newUser = {
      email,
      password: hashedPassword,
      username,
      verified: false,
    };

    // Attempt to send verification email and obtain userId
    const userId = await sendVerificationEmail(newUser);

    if (userId) {
      // If userId is obtained successfully, create the user
      newUser._id = userId; // Assign the userId to newUser

      const result = await User.create(newUser);
      res.status(200).json({
        status: "PENDING",
        message: "Verification Email Sent Successfully",
      });
    } else {
      // If there was an error sending the email or obtaining userId, return an error response
      res.status(500).json({ message: "An error occurred while sending the verification email." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* Send Verification Email */

const sendVerificationEmail = async ({ email }) => {
  try {
    const currentUrl = `${process.env.HOST}${process.env.PORT}`;
    const file = path.join(process.cwd(), "public", "verificationEmail.html");
    const html = fs.readFileSync(file, "utf8");

    // Generate a temporary userId
    const userId = mongoose.Types.ObjectId();

    const link = `${currentUrl}/user/verify/${userId}`;

    const htmlWithLinks = html.replace(/{link1}/g, link).replace(/{link2}/g, link);

    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Verify Your Email",
      html: htmlWithLinks,
    };

    const newVerification = new userVerification({
      userId: userId, // Save the temporary userId
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });

    await Promise.all([newVerification.save(), transporter.sendMail(mailOptions)]);

    return userId; // Return the temporary userId
  } catch (error) {
    console.error(error);
    return null; // Return null if there was an error
  }
};

  

/* Verify Emails */
export const verifyEmail = async (req, res) => {
  const { userId } = req.params;
  try {
    const verificationData = await userVerification.findOne({ userId });

    if (!verificationData) {
      const message = "Account record doesn't exist or has already been verified. Please sign up or log in.";
      return res.redirect(`/user/verified/?error=true&message=${message}`);
    }

    const expiresAt = verificationData.expiresAt;

    if (expiresAt < Date.now()) {
      await Promise.all([
        userVerification.deleteOne({ userId }),
        User.deleteOne({ _id: userId })
      ]);

      const message = "The verification link has expired. Please sign up again.";
      return res.redirect(`/user/verified/?error=true&message=${message}`);
    }

    await Promise.all([
      User.updateOne({ _id: userId }, { verified: true }),
      userVerification.deleteOne({ userId })
    ]);

    res.redirect(`/user/verified`);
  } catch (error) {
    console.error(error);
    const message = "An error occurred while verifying the email.";
    res.redirect(`/user/verified/?error=true&message=${message}`);
  }
};


/*Verify Html file Route*/

export const verified = async (req, res)=> {
    res.sendFile(path.join(process.cwd(), "public", "verified.html"));
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