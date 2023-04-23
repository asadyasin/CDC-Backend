import mongoose from "mongoose";

const userVerifactionSchema = mongoose.Schema({
     userId: 'String',
     createdAt: 'Date',
     expiresAt: 'Date'
})

export default mongoose.model("UserVerifaction", userVerifactionSchema);