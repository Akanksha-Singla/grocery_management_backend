import { Response } from "express";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";

export const sendSuccessResponse = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: any,
  pagination?: any
) => {
  return res.status(statusCode).json({
    statusCode,
    success: true,
    message,
    data,
    pagination,
  });
};
export const sendErrorResponse = (
    res: Response,
    statusCode: number,
    success: boolean,
    message: string,
    error?: any
  ) => {
    return res.status(statusCode).json({
      statusCode,
      success: false,
      message,
      error,
    });
  };
  export const sendSuccessToken = (
    res: Response,
    statusCode: number,
    success: boolean,
    message: string,
    token: string,
    refreshToken?: string,
     _id?:mongoose.Schema.Types.ObjectId,
    role?:string
   
  ) => {
    return res.status(statusCode).json({
      statusCode,
      success: true,
      message,
      token,
      refreshToken,
      _id,
      role
    });
  };
  