import mongoose from "mongoose";

const { Schema, model } = mongoose;

interface IUser extends Document {
    name: string;
    email: string;
    avatar: string;
  }

function arrayLimit(val:Array<string>) {
    return val.length <= 5;
  }
const PostModel= new Schema({
    text:{type:String,required:true},
    user:{type:mongoose.Types.ObjectId,ref:"user",required:true},
    tags: {type:[{ type: String}],
    validate: [arrayLimit, '{PATH} exceeds the limit of 5']}
},{timestamps:true})




export default model("post",PostModel)