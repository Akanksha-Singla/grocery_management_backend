import express from 'express';
import {AuthController} from '../controllers/authController'
import {validateRegisterUser,validateLoginUser} from '../validators/auth.validator'
import { verifyToken } from '../middlewares/auth.Middleware';


export const authRoutes = express.Router();

const authController = new AuthController()
authRoutes.post('/register',validateRegisterUser,authController.register)
authRoutes.post('/login',validateLoginUser,authController.login)
authRoutes.get('/get-user',verifyToken,authController.getUser);
