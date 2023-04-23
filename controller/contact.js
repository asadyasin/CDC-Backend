import mongoose from 'mongoose/index.js';
import ContactData from '../models/contactData.js';

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    } 
});


export const getMessages = async (req, res) => {
    try {
        const messageData = await ContactData.find();

        res.status(200).json(messageData);

    } catch (error) {
        res.status(404).json({message: error.message});
    }
}

export const createMessage = async (req, res) => {

    const message = req.body;

    const newMessage = new ContactData(message);

    try {
        
        await newMessage.save();

        res.status(201).json("Message Send Successfully");
    } catch (error) {
        res.status(409).json({message: error.message});
    }
}

export const deleteMessge = async (req, res) => {
    const {id: _id} = req.params;

    if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('No message with that id');

    await ContactData.findByIdAndRemove(_id);

    res.json({message: 'Message deleted successfully'})
}

export const emailReply = async (req, res) => {
    
    const { id , email , message } = req.body;
    
    try {

        if(!mongoose.Types.ObjectId.isValid(id))return res.status(404).send('No message against this id');

        const existingMessage = await ContactData.findOne({ _id: id });

        const userMessage = existingMessage.message;

        try {

            const mailOptions = {
                from: process.env.AUTH_EMAIL,
                to: email,
                subject: "Career & Degree Counselling reply to your message",
                html: `<p>Your Messgae is ${userMessage}</p><br><p>${message}</p>`,
            }
            
            await transporter.sendMail(mailOptions);

            try {

                await ContactData.updateOne({_id: id},{adminReply: message});
                res.status(200).send({message: "Reply send to user email successfully"});

            } catch (error) {
                res.status(500).send({message: error.message});
            }

        } catch (error) {
        
            res.status(409).json({message: error.message})
            
        }

    } catch (error) {
        res.status(409).json({message: error.message})
    }
}