import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { UserDoc, UsersModel } from "./types";

const validateEmail = function (email:any) {
    const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
  };
  function arrayLimit(val:Array<string>) {
    return val.length <= 10;
  }
const { Schema, model } = mongoose;

const UserModel= new Schema({
    name: { type: String, required: true },
    premiumPoints:{type:Number,default:300},
  email: {  
     type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: true,
    validate: [validateEmail, "Please fill a valid email address"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ]
},
  password: { type: String, required: true },
  avatar: {
    type: String,
    required: true,
    default:
      "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png",
  },
  refreshToken: { type: String },
  googleID: { type: String },
  role:{type:String,required: true, enum: ["Admin","Moderator","User"], default: "User"},
  Premium:{type:Boolean,default:false},
  bio:{type:String},
  interestedIn:{
    type:[{ type: String}],
  validate: [arrayLimit, '{PATH} exceeds the limit of 10']
},
  address:{type:String,required:true},
  followers:{type:[{type:mongoose.Types.ObjectId,ref:"user"}]},
  following:{type:[{type:mongoose.Types.ObjectId,ref:"user"}]},
  eventReqs:{type:[{type:mongoose.Types.ObjectId,ref:"user"}]},
  reportPoints:{type:Number,dafault:0}

},{timestamps: true})

UserModel.pre("save",async function () {
    const newUser=this
    if(newUser.password && newUser.isModified("password")){
        const password=newUser.password
        const hashedPassword=await bcrypt.hash(password,13)
        newUser.password=hashedPassword
    }
})

UserModel.pre("findOneAndUpdate", async function(){
    const update = this.getUpdate() as { password?: string };
    if (update.password) {
      const password = update.password;
      const hashedPW = await bcrypt.hash(password, 11);
      update.password = hashedPW;
    }
})


UserModel.methods.toJSON=function(){
    const UserDoc=this
    const UserObj=UserDoc.toObject()
    delete UserObj.password;
    delete UserObj.createdAt;
    delete UserObj.updatedAt;
    delete UserObj.__v;
    return UserObj;
}

UserModel.static("checkCredentials",async function(email,password){
    const user=await this.findOne({email})
    if(user){
    const matchingPassword=await bcrypt.compare(password,user.password)
    if(!matchingPassword)  return null
    return user
    }else return null
})

const UsersModel = model<UserDoc, UsersModel>("user", UserModel);

export default UsersModel
