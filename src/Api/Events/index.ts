import  Express  from "express";
import { JWTTokenAuth, UserRequest } from "../../lib/auth/jwt";
import EventModel from "./model"
import CommentSchema from "../Comments/model"
import UsersModel from "../Users/model";
import { EventPictureUploader } from "../../lib/cloudinary";
import createHttpError from "http-errors";

const EventRouter=Express.Router()


EventRouter.post("/",JWTTokenAuth,async(req,res,next)=>{
    const userId=(req as UserRequest).user?._id
    const user= await UsersModel.findById(userId)
    try {
        if(user?.Premium){
        const newEvent=new EventModel({
            name:req.body.name,
            address:req.body.address,
            description:req.body.description,
            tags:req.body.tags,
            Picture:req.body.Picture,
            Private:req.body.Private,
            user:userId,
            limit:req.body.limit,
            date:req.body.date,
            time:req.body.time
        })
       await newEvent.save()
        res.status(201).send(newEvent)
    }else{
        res.send("Only premium users can post events")
    }
    } catch (error) {
        next(error)
    }
})


EventRouter.get("/:id",JWTTokenAuth,async(req,res,next)=>{
    try {
        const event=await EventModel.findById(req.params.id).populate("user","_id name email avatar")
        if(event){
            res.send(event)
        }else{
            createHttpError(404,"No event with this id")
        }
    } catch (error) {
        next(error)
    }
})

EventRouter.get("/:id/user", JWTTokenAuth, async(req, res, next) => {
    try {
      const event = await EventModel.findById(req.params.id)
    //  .populate("user", "name email Avatar").exec();
    //   res.send(event);
    const userId=event?.user
    const user=await UsersModel.findById(userId)
    res.send(user)
    
    } catch (error) {
      next(error);
    }
  })
EventRouter.put("/:id",JWTTokenAuth,async(req,res,next)=>{
    try {
    
        const updated=await EventModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new:true,runValidators:true}
        ).populate("user", "_id name avatar email")

        res.send(updated)
    } catch (error) {
        next(error)
    }
})

EventRouter.delete("/:id",JWTTokenAuth,async(req,res,next)=>{
    try {
       const event= await EventModel.findByIdAndDelete(req.params.id)
       const events=await EventModel.find()
        res.status(204).send(events)
    } catch (error) {
        next(error)
    }
})


EventRouter.get("/:id/comms",JWTTokenAuth,async(req,res,next)=>{
    try {
        const comments=await CommentSchema.find({event:req.params.id})
        .populate("user", "_id name email avatar")
        res.send(comments)
    } catch (error) {
        next(error)
    }
})
EventRouter.post( "/:id/picture",EventPictureUploader,JWTTokenAuth, async (req, res, next) => {
    try {
       await EventModel.findByIdAndUpdate(req.params.id
        , {
        Picture: req.file?.path,
    });
    res.send({ Picture: req.file?.path });
    } catch (error) {
      next(error)
    }
   
  }
);
export default EventRouter