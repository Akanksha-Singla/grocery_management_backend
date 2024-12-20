import { UserModel, IUser } from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  sendSuccessResponse,
  sendErrorResponse,
  sendSuccessToken,
} from "../utils/responseUtils";
import { Request, Response } from "express";
import dotenv from "dotenv";
import { IRole, RoleModel } from "../models/roleModel";

dotenv.config();
interface IRoleSpecificDetail {
  [key: string]: string | boolean | number;
}

export class AuthController {
  public getUserByEmail = async (email: string) => {
    return await UserModel.findOne({ email: email });
  };
  public login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const newEmail = email.toLowerCase();
      const user = await this.getUserByEmail(newEmail);
      if (user) {
        const matchPassword = await bcrypt.compare(password, user.password);
        if (matchPassword) {
          const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.SECRET_KEY!,
            {
              expiresIn: "2h",
            }
          );

          const refreshToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.REFRESH_SECRET_KEY!,
            {
              expiresIn: "7h",
            }
          );
          user.refreshToken = refreshToken;
          await user.save();
          const _id = user._id;
          const role = user.role;
          sendSuccessToken(
            res,
            200,
            true,
            "Authentication successful!",
            token,
            refreshToken,
            _id,
            role
          );
        } else throw "Invalid username or password";
      } else throw "User not found";
    } catch (error) {
      sendErrorResponse(res, 500, false, "User login failed", error);
    }
  };
  public register = async (req: Request, res: Response) => {
    console.log("req.body :", req.body);
    try {
      let {
        username,
        password,
        email,
        contact_number,
        address,
        role,
        role_specific_details: inputRoleSpecificDetails = {}, // Default to empty object
      } = req.body;
  
      // Hash the password
      const hash = await bcrypt.hash(password, 10);
  
      // Find the role from the database
      const rolePerson = (await RoleModel.findOne({ role_name: role })) as IRole;
  
      if (!rolePerson) throw "Invalid role provided";
  
      // Handle role-specific details if any
      let role_specific_details: IRoleSpecificDetail = {};
  
      const roleTemplate = rolePerson.role_specific_details;
  
      // Only process role-specific details if a role template exists
      if (roleTemplate && Array.isArray(roleTemplate)) {
        for (const field of roleTemplate) {
          const fieldName = field.name;
          // Check if the field is present in inputRoleSpecificDetails
          if (inputRoleSpecificDetails && inputRoleSpecificDetails[fieldName]) {
            role_specific_details[fieldName] = inputRoleSpecificDetails[fieldName];
          } else {
            role_specific_details[fieldName] = ""; // Or default value if needed
          }
        }
      }
  
      // Create and save the new user
      const newUser = new UserModel({
        username,
        password: hash,
        email,
        contact_number,
        address,
        role_id: rolePerson._id,
        role: rolePerson.role_name,
        role_specific_details,
      });
  
      await newUser.save();
  
      sendSuccessResponse(res, 201, true, "User registered successfully", newUser);
    } catch (error) {
      sendErrorResponse(res, 400, false, `User registration failed ${error}`, error);
    }
  };
  
}
