import mongoose from "mongoose";

const { Schema, model } = mongoose;

const CommentSchema=new Schema({
    text:{type:String,requiredL:true},
    user:{type:mongoose.Types.ObjectId, ref:"user",required:true},
    post:{type:mongoose.Types.ObjectId,ref:"post"},
    event:{type:mongoose.Types.ObjectId,ref:"event"}
},{timestamps:true})



export default model("Comment",CommentSchema)