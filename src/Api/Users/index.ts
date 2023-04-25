import  Express  from "express";
import createHttpError from "http-errors";
import passport from "passport";
import { adminOnlyMiddleware } from "../../lib/auth/AdminMiddleware";
import { JWTTokenAuth, UserRequest } from "../../lib/auth/jwt";
import { createAccessToken, createRefreshToken } from "../../lib/auth/tools";
import { avatarUploader } from "../../lib/cloudinary";
import { googleRedirectRequest } from "../../types";
import UsersModel from "./model";
import { Request, Response, NextFunction } from "express";
import PostModel from "../Posts/model"
import EventModel from "../Events/model"

const UserRouter=Express.Router()


UserRouter.get("/googleLogin", passport.authenticate("google", { scope: ["profile", "email"] }))

UserRouter.get("/googleRedirect",
    passport.authenticate("google", {
      session: false,
      scope: ["profile", "email"],
    }),
    async (req, res, next) => {
      try {
        res.redirect(
          `${process.env.FE_DEV_URL}/app?accessToken=${
            (req.user as googleRedirectRequest).accessToken
          }`
        );
        console.log(req.user);
      } catch (error) {
        next(error);
      }
    }
  )


UserRouter.get("/me", JWTTokenAuth, async (req, res, next) => {
    try {
      const user = await UsersModel.findById((req as UserRequest).user!._id);
      res.send(user);
    } catch (error) {
      next(error);
    }
  })


  UserRouter.get("/me/posts",JWTTokenAuth,async(req,res,next)=>{
    try {
      const userId=(req as UserRequest).user?._id
    const user=await UsersModel.findById(userId)
    const tags=user?.interestedIn
      const postsAndEvents = await Promise.all([
        PostModel.find({ tags: { $in: tags } }).populate("user", "name email avatar"),
        EventModel.find({ tags: { $in: tags } }).populate("user", "name email avatar")
      ])
      res.send(postsAndEvents)
    } catch (error) {
      next(error)
    }
    })



  UserRouter.put("/me", JWTTokenAuth, async (req, res, next) => {
    try {
      const updatedUser = await UsersModel.findOneAndUpdate(
        { _id: (req as UserRequest).user!._id },
        req.body,
        { new: true, runValidators: true }
      );
      res.send(updatedUser);
    } catch (error) {
      next(error);
    }
  })





  UserRouter.post("/premium", async (req, res, next) => {
    try {
      const user = await UsersModel.findById((req as UserRequest).user?._id);
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      } else {
        if (user.Premium === true) {
          return res.send("User has already bought the premium status");
        } else if (user.premiumPoints < 300) {
          return res.send("Not enough premium points");
        } else {
          user.premiumPoints -= 300;
        }
        user.Premium = true;
  
        // save changes to database
        await user.save();
  
        res.send({ message: "User updated successfully" });
      }
    } catch (error) {
      next(error);
    }
  })





  
  UserRouter.post( "/me/avatar",avatarUploader,JWTTokenAuth, async (req, res, next) => {
    await UsersModel.findByIdAndUpdate((req as UserRequest).user!._id, {
      avatar: req.file?.path,
    });
    res.send({ avatarURL: req.file?.path });
  }
);
//Normal Routes
UserRouter.post("/",async(req,res,next)=>{
    try {
        const exists=await UsersModel.findOne({email:req.body.email})
        if(exists){
            res.status(409).send(`Email ${req.body.email} already in use`)
        }else{
            const newUser = new UsersModel(req.body);
            const user = await newUser.save();
            res.status(201).send("User created successfully")
        }
    } catch (error) {
        next(error)
    }
})

UserRouter.post("/login",async(req,res,next)=>{
    try {
        const { email, password,role } = req.body;
        const user = await UsersModel.checkCredentials(email, password);
        if(user){
          const payload={_id:user._id,email:user.email,role:user.role}
          const accessToken=await createAccessToken(payload)
          const refreshToken=await createRefreshToken(payload)
          res.send({ user, accessToken, refreshToken })
        }else{
            next(createHttpError(401, "Creditentials are not okay!"));
        }
    } catch (error) {
        next(error)
    }
})

//Admin/Moderator Routes

UserRouter.get("/",JWTTokenAuth,adminOnlyMiddleware,async(req,res,next)=>{
    try {
        const users = await UsersModel.find({
            _id: { $ne: (req as UserRequest).user!._id },
          });
          res.send(users)
    } catch (error) {
        next(error)
    }
})


UserRouter.get("/:id",JWTTokenAuth,adminOnlyMiddleware,async(req,res,next)=>{
    try {
        const User=await UsersModel.findById(req.params.id)
          if(User){
            res.send(User)
          }else{
            createHttpError(404,`User with id  ${req.params.id} not found`)
          }
    } catch (error) {
        next(error)
    }
})



UserRouter.put("/:id",JWTTokenAuth,adminOnlyMiddleware,async(req,res,next)=>{
    try {
        const updated= await UsersModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
        res.send(updated)
    } catch (error) {
        next(error)
    }
})


UserRouter.delete("/:id",JWTTokenAuth,adminOnlyMiddleware,async(req,res,next)=>{
    try {
        const deleted=await UsersModel.findByIdAndDelete(req.params.id)
        if(deleted){
                 res.status(204).send()
        }
    } catch (error) {
        next(error)
    }
})



export default UserRouter