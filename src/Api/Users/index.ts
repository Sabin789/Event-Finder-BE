import  Express  from "express";
import createHttpError from "http-errors";
import passport from "passport";
import { adminOnlyMiddleware } from "../../lib/auth/AdminMiddleware";
import { JWTTokenAuth, UserRequest } from "../../lib/auth/jwt";
import { createAccessToken, createRefreshToken } from "../../lib/auth/tools";
import { avatarUploader } from "../../lib/cloudinary";
import { googleRedirectRequest } from "../../types";
import UsersModel from "./model";
// import { Request, Response, NextFunction } from "express";
import PostModel from "../Posts/model"
import EventModel from "../Events/model"
import { moderatorOnlyMiddleware } from "../../lib/auth/ModeratorMiddleware";
import moment from "moment";
const UserRouter=Express.Router()
UserRouter.post( "/me/avatar",avatarUploader,JWTTokenAuth, async (req, res, next) => {
  try {
     await UsersModel.findByIdAndUpdate((req as UserRequest).user!._id, {
    avatar: req.file?.path,
  });

  res.send({ avatarURL: req.file?.path });
  } catch (error) {
    console.log(error)
    next(error)
  }
 
}
);

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
UserRouter.get("/",JWTTokenAuth,async(req,res,next)=>{
  try {
    const users=await UsersModel.find()
    res.send(users)
  } catch (error) {
    next(error)
  }
})

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
      const posts = await PostModel.find({
        tags: { $in: tags }
      }).populate("user","name avatar email")
      res.send(posts)
    } catch (error) {
      next(error)
    }
    })


    UserRouter.get("/me/events",JWTTokenAuth,async(req,res,next)=>{
      try {
        const userId=(req as UserRequest).user?._id
      const user=await UsersModel.findById(userId)
      const tags=user?.interestedIn
        const posts = await EventModel.find({
          tags: { $in: tags }
        }).populate("user","_id name email avatar eventReqs")
        res.send(posts)
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





  UserRouter.post("/premium", JWTTokenAuth,async (req, res, next) => {
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


UserRouter.get("/:id",JWTTokenAuth,async(req,res,next)=>{
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


// Follow Unfollow


UserRouter.put("/:id/FollowUnfollow",JWTTokenAuth,async(req,res,next)=>{
 try {
    const userId=(req as UserRequest).user?._id
    const follower=await UsersModel.findById(userId)
    const followed=await UsersModel.findById(req.params.id)
    if(!follower?.following.includes(req.params.id.toString())){
    await UsersModel.findByIdAndUpdate(
      userId,
      {$push:{following:req.params.id}},
      {new:true,runValidators:true}
      )
      await UsersModel.findByIdAndUpdate(
        req.params.id,
        {$push:{followers:userId}},
        {new:true,runValidators:true}
        )
        const newFollower=await UsersModel.findById(userId)
        res.send(newFollower)
    }else{
      await UsersModel.findByIdAndUpdate(
        userId,
        {$pull:{following:req.params.id}},
        {new:true,runValidators:true}
        )
        await UsersModel.findByIdAndUpdate(
          req.params.id,
          {$pull:{followers:userId}},
          {new:true,runValidators:true}
          )
          const newFollower=await UsersModel.findById(userId)
          res.send(newFollower)
    }
 } catch (error) {
  next(error)
 }
})
 
 
UserRouter.post("/:id/likeUnlikePost",JWTTokenAuth,async(req,res,next)=>{
  try {
    const userId=(req as UserRequest).user?._id

    const user=await UsersModel.findById(userId)
    const post=await PostModel.findById(req.params.id)
    if(!post?.likes.includes(user?._id)){
       await PostModel.findByIdAndUpdate(
         req.params.id,
        {
          $push: { likes: user?._id },
        },
        { new: true,runValidators:true }
      )
      res.send("liked")
    }else{
       await PostModel.findByIdAndUpdate(
        req.params.id,
       {
         $pull: { likes: user?._id },
       },
       { new: true,runValidators:true }
     )
     res.send("unliked")
    }
  } catch (error) {
    next(error)
  }
})



UserRouter.post("/:id/likeUnlikeEvent", JWTTokenAuth, async (req, res, next) => {
  try {
    const userId = (req as UserRequest).user?._id;
    const user = await UsersModel.findById(userId);
    const event = await EventModel.findById(req.params.id);

    if (!event?.likes.includes(user?._id)) {
      await EventModel.findByIdAndUpdate(
        req.params.id,
        { $push: { likes: user?._id } },
        { new: true, runValidators: true }
      );
    } else {
      await EventModel.findByIdAndUpdate(
        req.params.id,
        { $pull: { likes: user?._id } },
        { new: true, runValidators: true }
      );
    }

    const updatedEvent = await EventModel.findById(req.params.id);
    const likesCount = updatedEvent?.likes.length || 0; // get the updated likes count

    res.send(updatedEvent);
  } catch (error) {
    next(error);
  }
});
UserRouter.delete("/me/session", JWTTokenAuth, async (req, res, next) => {
  try {
    const user=await UsersModel.findByIdAndUpdate((req as UserRequest).user!._id, {
      refreshToken: "",
    });
    res.send(user);
  } catch (error) {
    next(error);
  }
})

UserRouter.post("/:id/joinLeave",JWTTokenAuth,async(req,res,next)=>{
try {
  const userId=(req as UserRequest).user?._id

    const user=await UsersModel.findById(userId)
    const event=await EventModel.findById(req.params.id)
    const members=event?.members
    const eventUserId= event?.user
    const eventUser=await UsersModel.findById(eventUserId)
    if(user?._id.toString() !== eventUserId?.toString()){
    if(!event?.Private){
     if(!members?.includes(user?._id)){
      await EventModel.findByIdAndUpdate(
        req.params.id,
        {$push:{members:user?._id}},
        {new:true,runValidators:true}
      )
      res.send(event)
     }else{
      await EventModel.findByIdAndUpdate(
        req.params.id,
        {$pull:{members:user?._id}},
        {new:true,runValidators:true}
      )
      res.send(event)
     }
  
    }else{
      
if(!members?.includes(user?._id)){
      if(!eventUser?.eventReqs.includes(user?._id)){
       await UsersModel.findByIdAndUpdate(
        eventUserId,
        {$push:{eventReqs:user?._id}},
        {new:true,runValidators:true}
        )
        res.send(user?._id)
      }else{
        await UsersModel.findByIdAndUpdate(
          eventUserId,
          {$pull:{eventReqs:user?._id}},
          {new:true,runValidators:true}
          )
          res.send(event)
      }
    }else{
      res.send("You are already a member of this event ")
    }
    }
  }else{
    res.send("You cannot add yourself")
  }
} catch (error) {
  next(error)
}
})

UserRouter.post("/:id/accept/:uid",JWTTokenAuth,async(req,res,next)=>{
  try {
    const userId=(req as UserRequest).user?._id

    const user=await UsersModel.findById(userId)
    const event=await EventModel.findById(req.params.id)
    if(user?.eventReqs.includes(req.params.uid)){
      await UsersModel.findByIdAndUpdate(
        userId,
        {$pull:{eventReqs:req.params.uid}},
        {new:true,runValidators:true}
      )
      await EventModel.findByIdAndUpdate(
        req.params.id,
         {$push:{members:req.params.uid}},
         {new:true,runValidators:true}
      )
      res.send("accepted")
    }else{
     res.send("nothing to accept")
    }
  } catch (error) {
    next(error)
  }
})


UserRouter.post("/:id/decline/:uid",JWTTokenAuth,async(req,res,next)=>{
  try {
    const userId=(req as UserRequest).user?._id

    const user=await UsersModel.findById(userId)
    const event=await EventModel.findById(req.params.id)
    if(user?.eventReqs.includes(req.params.uid)){
      await UsersModel.findByIdAndUpdate(
        userId,
        {$pull:{eventReqs:req.params.uid}},
        {new:true,runValidators:true}
      )
      await EventModel.findByIdAndUpdate(
        req.params.id,
         {$pull:{members:req.params.uid}},
         {new:true,runValidators:true}
      )
      res.send("decline")
    }else{
     res.send("nothing to decline")
    }
  } catch (error) {
      next(error)
  }
})

UserRouter.post('/:id/reportUser', JWTTokenAuth,async (req, res, next) => {
  try {
    const reportingUserId = (req as UserRequest).user?._id;
    const reportedUserId = req.params.id;
    const { reason } = req.body;


    const reportedUser = await UsersModel.findById(reportedUserId);
    if (!reportedUser) {
      return res.status(404).send('Reported user not found');
    }
    if(reportingUserId===reportedUserId){
      res.send("You cannot report yourself")
    }

    const newReport = {
      reportedUserId,
      reportingUserId,
      reason
    };


    await UsersModel.findByIdAndUpdate(reportedUserId, {
      $push: { reports: newReport }
    });

    res.send('User reported successfully');
  } catch (error) {
    next(error);
  }
});


UserRouter.get("/moderator/reportedUsers",JWTTokenAuth,
moderatorOnlyMiddleware,async(req,res,next)=>{
  try {
    const users = await UsersModel.find({ reports: { $exists: true, $not: { $size: 0 } } });
    res.send(users);
  } catch (error) {
    next(error)
  }
})


UserRouter.post("/:id/ban",JWTTokenAuth,
moderatorOnlyMiddleware,async(req,res,next)=>{
  try {
    const reporterId = (req as UserRequest).user?._id;
    const user = await UsersModel.findById(req.params.id);

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Add a report point to the user's account
    user.reportPoints = (user.reportPoints || 0) + 1;

    // Check if the user has more than 3 report points
    if (user.reportPoints > 3) {
      await UsersModel.findByIdAndDelete(user._id);
      return res.send("User deleted");
    }

    await user.save();

    res.send("Report added to user account");
  } catch (error) {
    next(error);
  }
})


 UserRouter.get("/me/reqs",JWTTokenAuth,async(req,res,next)=>{
  try {
    const userId = (req as UserRequest).user!._id;
    const user = await UsersModel.findById(userId).populate("eventReqs", "_id name email");
    if (user) {
      res.send(user.eventReqs);
    }
   
  } catch (error) {
    next(error)
  }
})
export default UserRouter