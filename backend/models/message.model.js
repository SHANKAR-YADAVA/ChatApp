import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Only for private chats
    },
    roomId: {
      type: String, // or ObjectId if you use Group model
      default: null, // Only for group chats
    },
    text: String,
    image: String, // Optional: image URL
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
