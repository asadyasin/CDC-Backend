import mongoose from "mongoose";

const userSchema = mongoose.Schema({
      username: {
            type: 'String',
            required: true,
            unique: false
      },
      email: {
            type: 'String', 
            required: true, 
            unique: true
      },
      password: {
            type: 'String',
            required: true
      },
      accountRole: {
            type: ['String'],
            default: ["user"]
      },
      verified: Boolean,
      createdAt:{
            type: 'Date',
            default: new Date()
      }
})

export default mongoose.model("User", userSchema);