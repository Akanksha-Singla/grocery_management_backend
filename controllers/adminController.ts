import {sendSuccessResponse,sendErrorResponse,sendSuccessToken} from "../utils/responseUtils"
import { Request, Response } from "express";
import { IUser,UserModel } from "../models/userModel";
import { DatabaseSync } from "node:sqlite";

export class AdminController{
    public getAllSellers = async(req:Request,res:Response)=>{
        try{
            
               
              
                // res.json({
                //   posts: posts.slice(from, to).reverse(),
                //   page,
                //   pageCount
                // });
             
              
            const data  = await UserModel.find({role:"Seller"}).select('-password')
            const sellerCount = data.length;
            const perPage = 10;
            const pageCount = Math.ceil(sellerCount / perPage);
          
            let page = 5
            if(page < 1) page = 1;
            if(page > pageCount) page = pageCount;
          
            const from = sellerCount - ((page - 1) * perPage) - 1; // ex.: 44 - ((1 - 1) * 10) -1 = 43 (44 is count, 43 is index)
            let to = sellerCount - (page * perPage); // ex.: 44 - (1 * 10) = 34
            if(to < 0) to = 0;
            sendSuccessResponse(res,200,true,"Data fetched successfuly",data)
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