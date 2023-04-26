import createHttpError from "http-errors"
import { UserRequest } from "./jwt"
import { Request, Response, NextFunction } from "express";



export const moderatorOnlyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if ((req as UserRequest).user!.role === "Moderator") {
    next()
  } else {
    next(createHttpError(403, "Moderator only endpoint!"))
  }
}