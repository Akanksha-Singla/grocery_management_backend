import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { sendErrorResponse } from "../utils/responseUtils";
import dotenv from "dotenv";

dotenv.config();
export interface CustomRequest extends Request {
  token: string | JwtPayload;
}
export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "").trim();
    if (!token) {
      res.status(400).json("No token found");
    } else {
      const decoded = jwt.verify(token, process.env.SECRET_KEY!);
      (req as CustomRequest).token = decoded;

      next();
    }
  } catch (error) {
    sendErrorResponse(res, 401, false, "Tokenis not valid", error);
  }
};
