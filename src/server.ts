import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors, { CorsOptions } from "cors";
import passport from "passport";
import createHttpError from "http-errors";
import { badRequestHandler, forbiddenHandler, genericErrorHandler, notFoundHandler, unauthorizedErrorHnalder } from "./errorHandlers";
import UserRouter from "./Api/Users";
import googleStrategy from "./lib/auth/googleOAuth";
import PostsRouter from "./Api/Posts";
import CommentRouter from "./Api/Comments";
import EventRouter from "./Api/Events";


const expressServer=express()

const httpServer = createServer(expressServer);
const socketioServer = new Server(httpServer);

passport.use("google", googleStrategy)

const whiteList = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];
const corsOptions: CorsOptions = {
  origin: (currentOrigin, corsNext) => {
    if (!currentOrigin || whiteList.includes(currentOrigin)) {
      corsNext(null, true);
    } else {
      corsNext(
        createHttpError(400, `This origin is not allowed! ${currentOrigin}`)
      );
    }
  },
};

// socketioServer.on("connect", newConnectionHandler)

expressServer.use(cors(corsOptions));
expressServer.use(express.json());

expressServer.use("/Users",UserRouter)
expressServer.use("/Posts",PostsRouter)
expressServer.use("/Comments",CommentRouter)
expressServer.use("/Events",EventRouter)


expressServer.use(badRequestHandler)
expressServer.use(unauthorizedErrorHnalder)
expressServer.use(forbiddenHandler)
expressServer.use(notFoundHandler)
expressServer.use(genericErrorHandler)



export { httpServer, expressServer };