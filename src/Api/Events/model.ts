import mongoose from "mongoose";

const { Schema, model } = mongoose;

function arrayLimit(val:Array<string>) {
    return val.length <= 10;
  }

const EventModel= new Schema({
  name:{type:String,required:true},
  address:{type:String,required:true},
  description:{type:String,required:true},
  tags: {type:[{ type: String}],
    validate: [arrayLimit, '{PATH} exceeds the limit of 10']},
   Picture:{type:String},
   ActiveStatus:{type:Boolean,default:true},
   Private:{type:Boolean,default:false},
   user:{type:mongoose.Types.ObjectId,ref:"user",required:true},
   members:{type:[{type:String}]},
   limit:{type:Number},
   likes:{type:[{type:String}]}
},{timestamps:true})

export default model("event",EventModel)