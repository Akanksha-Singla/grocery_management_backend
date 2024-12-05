import express from 'express';
import {AuthController} from '../controllers/authController'
import {validateRegisterUser,validateLoginUser} from '../validators/auth.validator'

export const authRoutes = express.Router();

const authController = new AuthController()
authRoutes.post('/register',validateRegisterUser,authController.register)
authRoutes.post('/login',validateLoginUser,authController.login)