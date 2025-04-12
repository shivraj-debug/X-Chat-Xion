// models/Message.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IMessage extends Document {
  userId: mongoose.Schema.Types.ObjectId; // Reference to the User model
  sessionId: string;
  sender: 'user' | 'ai';
  content: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IMessage>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
    },
    sessionId: {
      type: String,
      required: true, // To group messages by session
    },
    sender: {
      type: String,
      enum: ['user', 'ai'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMessage>('Chat', chatSchema);
