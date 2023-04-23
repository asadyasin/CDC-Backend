import mongoose from "mongoose";

const contactSchema = mongoose.Schema({
    name: 'String',
    email: 'String',
    message: 'String',
    userid: 'String',
    adminReply: 'String',
    createdAt:{
        type: Date,
        default: new Date()
    },
});

const contactData = mongoose.model('ContactData',contactSchema);

export default contactData;