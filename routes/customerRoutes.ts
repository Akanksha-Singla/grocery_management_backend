import express from 'express';
import { verifyToken } from '../middlewares/auth.Middleware';
import { authorizeRole } from '../middlewares/role.middleware';


export const customerRoutes = express();

customerRoutes.get('/customerpage',verifyToken,authorizeRole("customer"),(req,res)=>{
    res.json("I am customer")
})