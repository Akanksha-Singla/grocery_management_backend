import {sendSuccessResponse,sendErrorResponse} from "../utils/responseUtils"
import { Request, Response } from "express";
import { IUser,UserModel } from "../models/userModel";

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

    public updateSellerStatus = async (req: Request, res: Response) => {
        try {
            const  sellerId  = req.params._id;
            const status    = req.query.status
            console.log("status",status)
            // Check if sellerId and status are provided
            if (!sellerId || !status) {
                sendErrorResponse(res, 400, false, "Seller ID and status are required")
                return;
            }
    
            // Ensure the status is a valid status
            const validStatuses = ["pending", "approved", "reject"]; // Modify according to your status types
            if (!validStatuses.includes(req.query.status as string)) {
                sendErrorResponse(res, 400, false, "Invalid status");
                return;
            }
    
            // Update the seller's status
            const updatedSeller = await UserModel.findOneAndUpdate(
                { _id: sellerId, role: "Seller" }, // Make sure we are updating a seller
                { $set: { status: status } }, // Update the status field
                { new: true } // Return the updated document
            );
    
            if (!updatedSeller) {
             sendErrorResponse(res, 404, false, "Seller not found or status not updated");
             return; 
            }
    
            sendSuccessResponse(res, 200, true, "Seller status updated successfully", updatedSeller);
        } catch (error) {
            sendErrorResponse(res, 500, false, "An error occurred while updating status", error);
        }
    }
    

}