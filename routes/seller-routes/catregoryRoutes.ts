import express, { Request, Response } from 'express';
import { verifyToken } from '../../middlewares/auth.Middleware';
import { authorizeRole } from '../../middlewares/role.middleware';
import { CategoryController } from '../../controllers/seller-contoller/categoryController';



export const categoryRoutes = express();
export const categoryController = new CategoryController()
categoryRoutes.post('/addCategory',verifyToken,authorizeRole("Seller"),categoryController.addCategory)
categoryRoutes.get('/getAllCategories',verifyToken,authorizeRole("Seller","Customer"),categoryController.getAllCategory)