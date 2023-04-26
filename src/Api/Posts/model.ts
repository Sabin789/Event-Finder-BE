import mongoose from "mongoose";

const { Schema, model } = mongoose;

interface ILikes {
  likes: string[];
}

const LikesSchema = new Schema<ILikes>({
  likes: {
    type: [String],
    default: [],
  },
});

function arrayLimit(val:Array<string>) {
    return val.length <= 5;
  }
const PostModel= new Schema({
    text:{type:String,required:true},
    user:{type:mongoose.Types.ObjectId,ref:"user",required:true},
    tags: {type:[{ type: String}],
    validate: [arrayLimit, '{PATH} exceeds the limit of 5']},
    likes: {
      type: [{type:String}]
    }
},{timestamps:true})




export default model("post",PostModel)