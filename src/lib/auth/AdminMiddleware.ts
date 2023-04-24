import createHttpError from "http-errors"
import { UserRequest } from "./jwt"
import { Request, Response, NextFunction } from "express";



export const adminOnlyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if ((req as UserRequest).user!.role === "Admin") {
    next()
  } else {
    next(createHttpError(403, "Admins only endpoint!"))
  }
}