import mongoose from "mongoose";

const userSchema = mongoose.Schema({
      username: {
            type: String,
            required: true,
            unique: false
      },
      email: {
            type: String, 
            required: true, 
            match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            unique: true
      },
      password: {
            type: String,
            required: true
      },
      accountRole: {
            type: [String],
            default: ["user"]
      },
      verified: Boolean,
      createdAt:{
            type: Date,
            default: new Date()
      }
})

export default mongoose.model("User", userSchema);