import { RoleController } from "../controllers/roleController";
import express from "express";

export const roleRoutes = express();

const roleController = new RoleController()

roleRoutes.post('/addRole',roleController.addRole)
