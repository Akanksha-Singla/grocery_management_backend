import { RoleModel } from "../models/roleModel";
import {Request,Response} from "express"
import { sendErrorResponse,sendSuccessResponse } from "../utils/responseUtils";

export class RoleController{
    public addRole = async(req:Request,res:Response)=>{
       try{
        const { role_name, role_permission, role_specific_details } = req.body;
        const role = new RoleModel({
            role_name,
            role_permission,
            role_specific_details,
          });
        const savedRole = await role.save();
        sendSuccessResponse(res, 201, true, "Role added successfully", savedRole);
       }
       catch (error){
        sendErrorResponse(res, 500, false, "Failed to add role", error);
       }
    }
}