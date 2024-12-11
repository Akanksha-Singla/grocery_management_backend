import { CategoryModel } from "../../models/categoryModel";
import {Request,Response} from "express"
import {sendSuccessResponse,sendErrorResponse} from "../../utils/responseUtils";


export class CategoryController{
    public addCategory = async(req:Request,res:Response)=>{
        try{
          const { name ,description } = req.body
          const category = new CategoryModel({
            name,
            description
          })
           const savedCategory = await category.save();
           sendSuccessResponse(res, 201, true, "Category  added successfully", savedCategory);
            
        }catch(error){
            sendErrorResponse(res, 500, false, "Failed to add category", error);
        }
    }

    public getAllCategory = async(req:Request, res:Response)=>{
        try{
            const data = await CategoryModel.find()
            sendSuccessResponse(res,200,true,'All category request',data)
        }
        catch(error){
            sendErrorResponse(res, 404, false, "No data found",error);
        }
       
    }
}