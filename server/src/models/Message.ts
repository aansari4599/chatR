import mongoose, { Document, Schema, Types } from "mongoose";
import xss from "xss";

export interface IFile {
  url: string;
  name: string;
  type: string;
  size: number;
}

export interface IMessage extends Document {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  content?: string;
  files: IFile[];
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: {
    type: String,
    set: (v: string) => v ? xss(v.trim()) : v,
  },
  files: [{
    url: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, required: true },
  }],
  createdAt: { type: Date, default: Date.now },
});

messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ createdAt: -1 });

export default mongoose.model<IMessage>("Message", messageSchema);
