import  Express  from "express";
import { JWTTokenAuth } from "../../lib/auth/jwt";
import CommentSchema from "./model"

const CommentRouter=Express.Router()

CommentRouter.post("/",JWTTokenAuth,async(req,res,next)=>{
    try {
        const Comment=new CommentSchema(req.body)
        
        await Comment.save()
        res.send("Posted Succesfully")
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