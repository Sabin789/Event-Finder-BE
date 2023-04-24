import  Express  from "express";
import { JWTTokenAuth, UserRequest } from "../../lib/auth/jwt";
import EventModel from "./model"
import CommentSchema from "../Comments/model"

const EventRouter=Express.Router()


EventRouter.post("/",JWTTokenAuth,async(req,res,next)=>{
    try {
        const newEvent=new EventModel(req.body)
       await newEvent.save()
        res.status(201).send("Event successfully posted")
    } catch (error) {
        next(error)
    }
})

EventRouter.put("/:id",JWTTokenAuth,async(req,res,next)=>{
    try {
    
        const updated=await EventModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new:true,runValidators:true}
        )
        res.send(updated)
    } catch (error) {
        next(error)
    }
})

EventRouter.delete("/:id",JWTTokenAuth,async(req,res,next)=>{
    try {
        await EventModel.findByIdAndDelete(req.params.id)
        res.status(204).send()
    } catch (error) {
        next(error)
    }
})


EventRouter.get("/:id/comms",JWTTokenAuth,async(req,res,next)=>{
    try {
        const comments=await CommentSchema.find({post:req.params.id})
        res.send(comments)
    } catch (error) {
        next(error)
    }
})

export default EventRouter