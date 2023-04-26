import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import chatModel from "../Api/Chats/model"
import mongoose from "mongoose";


let onlineUserList: any = [];
let newRoom: string;
let displayedMessages: any = [];

export const newConnectionHandler = (socket: Socket) => {
  console.log(`New userJoined their id is ${socket.id}`);
  socket.emit("Welcome", socket.id);

  socket.on("setUser", (data: { token: string }) => {
    const { token } = data;
    const secret = process.env.JWT_SECRET as string;

    jwt.verify(token, secret, (err, decoded: any) => {
      if (err) {
        console.log("Token verification failed:", err);
      } else {
        onlineUserList.push({
          email: decoded.email,
          _id: decoded._id,
          socketId: socket.id,
        });
        console.log(onlineUserList);
      }
    });
  });
  socket.on("join-room", (room) => {
    console.log(room);
    newRoom = room;
    console.log(newRoom);
    socket.join(room);
  });

  socket.on(
    "outgoing-msg",
    async ({ room, message }: { room: string; message: any }) => {
      console.log(room);
      const chatRoomId = new mongoose.Types.ObjectId(room);
      socket.to(String(chatRoomId)).emit(message, {
        room: room,
        message: {
          sender: String,
          content: {
            text: String,
          },
        },
      });
      console.log(message);
      await chatModel.findByIdAndUpdate(
        String(chatRoomId),
        { $push: { messages: message } },
        { new: true, runValidators: true }
      );
      let messageout = await chatModel.findById(String(chatRoomId));
      socket.emit("incoming-msg", messageout);
    }
  );

  socket.on("incoming-msg", async ({ room }: { room: string }) => {

    const chatRoomId = new mongoose.Types.ObjectId(room);
    const chat = await chatModel.findById(String(chatRoomId));
    displayedMessages.push(chat?.messages);
    socket.emit(displayedMessages)
  });

  socket.on("disconnect", () => {
    onlineUserList = onlineUserList.filter(
      (a: any) => a.socketId !== socket.id
    );
    socket.broadcast.emit("updateOnlineUsersList", onlineUserList);
    console.log(`User with socketId of ${socket.id} disconnected`);
    console.log(onlineUserList);
  });
};
