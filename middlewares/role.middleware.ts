import { NextFunction, Request, Response,RequestHandler } from "express"
import { IUser } from "../models/userModel"


export interface IUserRoleRequest extends Request{
    token:any
}

export const authorizeRole = (...allowedRoles: string[]): RequestHandler => {
    return (req, res, next):void => {
      // Assert the type of req to IUserRoleRequest
      const userReq = req as IUserRoleRequest;
      console.log("userReq.role",userReq.token.role)
      if (!allowedRoles.includes(userReq.token.role)) {
         res.status(403).json({ message: "Access denied" })
         return;
      }
      next();
    };
  };
