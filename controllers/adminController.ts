import {sendSuccessResponse,sendErrorResponse} from "../utils/responseUtils"
import { Request, Response } from "express";
import { IUser,UserModel } from "../models/userModel";
import { UserStatus } from "../utils/enumUtils";

export class AdminController{
    // New
    public getAllSellers = async(req:Request,res:Response)=>{
        try{      
            const status=req.query.status;
            const page=parseInt(req.query.page as string)
            const limit=parseInt(req.query.limit as string)
            let totalItems;
            let totalPages;
            if(page<1 || limit < 1){
                sendSuccessResponse(res,400,false,"page and limit must be positive integers")
            }else{
                const skip=(page-1)*limit;
                if(status){
                    const result=await UserModel.find({
                        role:"Seller",
                        status:status
                        })
                        .sort({updated_at:-1})
                        .skip(skip)
                        .limit(limit)
                        .exec();
                        totalItems=await UserModel.countDocuments({
                            role:"Seller",
                            status:status
                        })
                        totalPages=Math.ceil(totalItems/limit);
                        sendSuccessResponse(res,200,true,`All seller request: ${status}`,result,{
                            currentPage:page,
                            totalPages:totalPages,
                            totalItems:totalItems
                        })

                    }else{
                        const result=await UserModel.find({
                            role:"Seller",
                            })
                            .sort({updated_at:-1})
                            .skip(skip)
                            .limit(limit)
                            .exec();
                            totalItems=await UserModel.countDocuments({
                                role:"Seller",
                            })
                            totalPages=Math.ceil(totalItems/limit);
                            sendSuccessResponse(res,200,true,`All seller request`,result,{
                                currentPage:page,
                                totalPages:totalPages,
                                totalItems:totalItems
                            })
                    }
                }
            }
        catch(error){
            sendErrorResponse(res, 404, false, "No data found",error);
        }
    }


    
    public updateSellerStatus = async (req: Request, res: Response): Promise<void> => {
      try {
        // Destructure parameters and query
        const { _id: sellerId } = req.params;
        const { status } = req.query;
    
        console.log("Requested Status:", status);
    
        // Validate inputs
        if (!sellerId || !status) {
          sendErrorResponse(res, 400, false, "Seller ID and status are required");
          return;
        }
    
        // Validate status using the enum
        if (!Object.values(UserStatus).includes(status as UserStatus)) {
          sendErrorResponse(res, 400, false, `Invalid status. Allowed values: ${Object.values(UserStatus).join(", ")}`);
          return;
        }
    
        // Update the seller's status
        const updatedSeller = await UserModel.findOneAndUpdate(
          { _id: sellerId, role: "Seller" }, 
          { $set: { status } }, 
          { new: true } 
        );
    
        // Handle case where seller is not found
        if (!updatedSeller) {
          sendErrorResponse(res, 404, false, "Seller not found or status not updated");
          return;
        }
    
        // Success response
        sendSuccessResponse(res, 200, true, "Seller status updated successfully", updatedSeller);
      } catch (error) {
        console.error("Error updating seller status:", error);
        sendErrorResponse(res, 500, false, "An error occurred while updating status", error);
      }
    };
}