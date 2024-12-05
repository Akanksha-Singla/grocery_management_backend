import express from 'express';
import { verifyToken } from '../middlewares/auth.Middleware';
import { AdminController } from '../controllers/adminController';
export const adminRoutes = express();
import { authorizeRole } from '../middlewares/role.middleware';



const adminController = new AdminController()
adminRoutes.get('/adminpage',verifyToken,(req,res)=>{
    console.log("admin")
    res.json({message:"I am admin"})
})
adminRoutes.get('/getAllSellers',verifyToken,authorizeRole("Admin"),adminController.getAllSellers)
adminRoutes.patch('/updateSellerStatus/:_id',verifyToken,authorizeRole("Admin"),adminController.updateSellerStatus)
