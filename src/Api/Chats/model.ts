import mongoose from "mongoose";
import { Message } from "./types";
const { Schema, model } = mongoose;


const chatSchema= new Schema({
    members:[{type:mongoose.Types.ObjectId,required:false,ref:"user"}],
    messages:[]
})

export default model("chat",chatSchema)