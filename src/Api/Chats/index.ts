import  Express  from "express";
import { JWTTokenAuth, UserRequest } from "../../lib/auth/jwt";
import { Server, Socket } from "socket.io";
import chatModel from "./model";


const chatRouter = Express.Router();

chatRouter.post("/", JWTTokenAuth, async (req, res, next) => {
    try {
      const sender = (req as UserRequest).user!._id;
  
      const recipient = req.body.recipient;
      const exists = await chatModel.findOne({
        members: { $in: [sender, recipient] },
      });
      if (exists) {
        console.log((req as UserRequest).user!._id);
        res.status(200).send(exists);
      } else {
        const newChat = await chatModel.create({
          members: [sender, recipient],
          messages: [],
        });
        res.status(201).send(newChat);
      }
    } catch (error) {
      next(error);
    }
  })

const io = new Server()