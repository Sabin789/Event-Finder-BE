import mongoose, { Model } from "mongoose";
import { chatDoc } from "./types";

const { Schema, model } = mongoose;


const messageSchema = new Schema(
    {
      sender: { type: Schema.Types.ObjectId, ref: "user" },
      content: {
        text: { type: String },
        media: { type: String },
      },
    },
    {
      timestamps: true,
    }
    )

const chatSchema= new Schema({
    members:[{type:mongoose.Types.ObjectId,required:false,ref:"user"}],
    messages:[messageSchema]
})

const chatModel: Model<chatDoc> = model<chatDoc>("chat", chatSchema);
export default chatModel;