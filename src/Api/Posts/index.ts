import Express from "express";
import createHttpError from "http-errors";
import { JWTTokenAuth, UserRequest } from "../../lib/auth/jwt";
import UsersModel from "../Users/model";
import PostModel from "./model"
import CommentSchema from "../Comments/model"

const PostsRouter=Express.Router()

PostsRouter.post("/",JWTTokenAuth,async(req,res,next)=>{
    try {
        const userId=(req as UserRequest).user?._id
        const user= await UsersModel.findById(userId)
       
        const Post=new PostModel({
            text:req.body.text,
            user:userId,
            tags:req.body.tags
        })
        await Post.save()
        res.send("Posted Succesfully")
    
    } catch (error) {
        next(error)
    }
})

PostsRouter.get("/",JWTTokenAuth,async(req,res,next)=>{
    try {
        const currentUserId = (req as UserRequest).user!._id;
        const user=await UsersModel.findById(currentUserId)
        const Posts=await PostModel.find({user:currentUserId})
        .populate("user", "name email avatar")
        if (Posts) {
            res.status(200).send(Posts);
          } else {
            res.send("Invalid user");
          }
    } catch (error) {
        next(error)
    }
})



PostsRouter.get("/:id",JWTTokenAuth,async(req,res,next)=>{
    try {
        const currentUserId = (req as UserRequest).user!._id;
        const currentPost=await PostModel.findById(req.params.id)

         if(currentPost){
            const postId=currentPost._id
            const comments=await CommentSchema.find({post:postId})
        res.send(currentPost)
        // res.send(comments)
         }else{
            createHttpError(404,`Post with id  ${req.params.id} not found`)
         }
    } catch (error) {
        next(error)
    }
})

PostsRouter.put("/:id",JWTTokenAuth,async(req,res,next)=>{
    try {
         const updated= await PostModel.findByIdAndUpdate(req.params.id,
            req.body,
            {new:true,runValidators:true})
            res.send(updated)
    } catch (error) {
        next(error)
    }
})

PostsRouter.delete("/:id",JWTTokenAuth,async(req,res,next)=>{
    try {
        await PostModel.findByIdAndDelete(req.params.id)
        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

PostsRouter.get("/:id/comms",JWTTokenAuth,async(req,res,next)=>{
    try {
        const comments=await CommentSchema.find({post:req.params.id})
        res.send(comments)
    } catch (error) {
        next(error)
    }
})

export default PostsRouter
