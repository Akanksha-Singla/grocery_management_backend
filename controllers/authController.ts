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
export const getUserFromToken = async (
  req: Request
): Promise<IUser | undefined> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.error("No token provided");
      return undefined;
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
      id: string;
      role: string;
    };
    const user = (await UserModel.findOne({ _id: decoded.id }).exec()) as IUser;

    if (!user) {
      console.error("User not found");
      return undefined;
    }

    return user;
  } catch (error) {
    console.error("Invalid token", error);
    return undefined;
  }
};
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
        role_specific_details: inputRoleSpecificDetails = {}, 
      } = req.body;
  
     
      const hash = await bcrypt.hash(password, 10);
  
      
      const rolePerson = (await RoleModel.findOne({ role_name: role })) as IRole;
  
      if (!rolePerson) throw "Invalid role provided";
  
     
      let role_specific_details: IRoleSpecificDetail = {};
  
      const roleTemplate = rolePerson.role_specific_details;
  
      
      if (roleTemplate && Array.isArray(roleTemplate)) {
        for (const field of roleTemplate) {
          const fieldName = field.name;

          if (inputRoleSpecificDetails && inputRoleSpecificDetails[fieldName]) {
            role_specific_details[fieldName] = inputRoleSpecificDetails[fieldName];
          } else {
            role_specific_details[fieldName] = ""; 
          }
        }
      }
  
   
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
  
  public getUser = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) throw`No token provided`
       else {
        const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
          id: string;
          role: string;
        };
        const user = (await UserModel.findOne({
          _id: decoded.id,
        }).exec()) as IUser;

        if (!user) throw `User not found`
        sendSuccessResponse(res, 200, true, "user", user);
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, `Internal server error`,error);
    }
  };
  
}
