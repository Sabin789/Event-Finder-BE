import  Express  from "express";
import { JWTTokenAuth, UserRequest } from "../../lib/auth/jwt";
import CommentSchema from "./model"

const CommentRouter=Express.Router()

CommentRouter.post("/",JWTTokenAuth,async(req,res,next)=>{
    try {
        const Comment=new CommentSchema({
            text:req.body.text,
            user:(req as UserRequest).user!._id,
            event:req.body.event,
            post:req.body.post
        })
        
        await Comment.save()
        const populatedComment = await Comment
  .populate("user", "_id name email avatar")


res.send(populatedComment)
    } catch (error) {
        next(error)
    }
})



CommentRouter.put("/:id",JWTTokenAuth,async(req,res,next)=>{
    try {
        const currentComment=await CommentSchema.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new:true,runValidators:true}
        )
        res.send(currentComment)
    } catch (error) {
        next(error)
    }
})

CommentRouter.delete("/:id",JWTTokenAuth,async(req,res,next)=>{
    try {

        
  await CommentSchema.findByIdAndDelete(req.params.id)
  res.status(204).send()
        
    } catch (error) {
        next(error)
    }
})


export default CommentRouter