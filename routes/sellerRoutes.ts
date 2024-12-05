import express, { Request, Response } from 'express';
import { verifyToken } from '../middlewares/auth.Middleware';
import { authorizeRole } from '../middlewares/role.middleware';



export const sellerRoutes = express();

sellerRoutes.get('/getSeller',verifyToken,authorizeRole("seller"),(req:Request,res:Response)=>{
    console.log("seller api")
  res.json({message:"I am seller"})
})