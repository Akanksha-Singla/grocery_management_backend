import {sendSuccessResponse,sendErrorResponse,sendSuccessToken} from "../../utils/responseUtils"
import { Request, Response } from "express";
import { IProduct,ProductModel} from "../../models/productModel";
import { ObjectId } from "mongodb";

export class ProductController{
        public addProduct = async(req: Request,res:Response)=>{
        console.log("req.body",req.body)
        try{
            let{
              name,
              description,
              category,
              price,
              quantity,
              availability,
              } = req.body
            const newProduct = new ProductModel({
              name,
              description,
              category,
              price,
              quantity,
              availability,
               });
          
              await newProduct.save();
              sendSuccessResponse(res, 201, true, "Product added successfully", newProduct);
        }
        catch(error){
            sendErrorResponse(res, 400, false, `Failed to add product ${error}`, error);
        }}

        public getProductsByCategory = async (req:Request, res:Response) => {
            const { categoryId } = req.params;
            console.log("categoryId",categoryId)
          
            try {
              // Find products matching the category ID
              const products = await ProductModel.find({ category: categoryId }).populate('category', 'name description');
          
              if (products.length === 0) {
                sendSuccessResponse(res, 200, true, "No product found in this category");
              }
          
              sendSuccessResponse(res, 200, true, "Products in this category",products);
            } catch (error) {
                sendErrorResponse(res, 400, false, `Failed to add product ${error}`, error); 
            }
          };
         
          public getProductById = async (
            req: Request,
            res: Response
          ): Promise<void> => {
            try {
              // const _id = new ObjectId(req.params.productid);
              const {_id} = req.params;
              console.log("id",_id)
              const product = await ProductModel.findOne({
                _id: _id,
               }).populate('category', 'name description');
        
              if (!product) throw "Product not found"
              sendSuccessResponse(res, 200, true, "product", product);
            } catch (error) {
              sendSuccessResponse(res, 500, false, "Error fetching Product", error);
            }
          };

          public getAllProducts = async (
            req: Request,
            res: Response
          ): Promise<void> => {
            try {
              const page = parseInt(req.query.page as string) || 1;
              const limit = parseInt(req.query.limit as string) || 10;
              let totalItems;
              let totalPages;
              if (page < 1 || limit < 1) {
                 sendSuccessResponse(res,400,false,"page and limit must be positive integers")
              } else {
                const skip = (page - 1) * limit;
        
                // const user = await getUserFromToken(req);
                // const retailerId = user?._id;
        
                const products= await ProductModel.find().populate('category', 'name description')
                .sort({updated_at:-1})  
                .skip(skip)
                .limit(limit);
        
                totalItems = await ProductModel.countDocuments({});
        
                totalPages = Math.ceil(totalItems / limit);
                sendSuccessResponse(res, 200, true, "All Products", products, {
                  currentPage: page,
                  totalPages: totalPages,
                  totalItems: totalItems,
                });
              }
            } catch (error) {
              sendSuccessResponse(
                res,
                500,
                false,
                "No data found",
                error
              );
            }
          };

          public deleteProduct = async(req:Request,res:Response):Promise<void>=>{
            const {_id} = req.params;
            console.log("id",_id)
            try{
                const deleteProduct = await ProductModel.findByIdAndDelete(_id)
                console.log("deleted",deleteProduct)
                if(!deleteProduct)throw "Product not found"
               
                sendSuccessResponse(res, 200, true, "Product Item deleted successfully");
            }catch(error){
                 sendErrorResponse(res,500,false,"Error deleting Product",error)
            }

          }
          public updateProduct = async (
            req: Request,
            res: Response
          ): Promise<void> => {
            try {
              const { _id } = req.params;
              const productData: IProduct = req.body;
              const updatedProduct = await ProductModel.findByIdAndUpdate(
                { _id: _id},
                productData,
                {
                  new: true,
                  runValidators: true,
                }
              );
        
              if (!updatedProduct) throw "Product not found";
        
              sendSuccessResponse(
                res,
                200,
                true,
                "Product updated successfully",
                updatedProduct
              );
            } catch (error) {
              sendErrorResponse(res, 500, false, "Error updating Product", error);
            }
          };
         
          public searchProduct = async (
            req: Request,
            res: Response
          ): Promise<void> => {
            try {
              const { query } = req.query;
              console.log("query",query)
        
              if (!query) throw  "Query parameter is required and must be a string Or Unauthorized or invalid user details."
               else {
                const searchFields = ["name", "description"];
               
        
                let products: IProduct[] = [];
        
                for (let field of searchFields) {
                  products= await ProductModel.find({
                   [field]: { $regex: query, $options: "i" },
                    // [field]: query,
                  }).populate('category','name description').exec();
        
                  if (products.length > 0) {
                    break;
                  }
                }
                if (products.length === 0) {
                  sendSuccessResponse(res,200,true,"No product found matching the search criteria",products)
                } else {
                  sendSuccessResponse(res,200,true,"data",products)
                }
              }
            } catch (error) {
              sendErrorResponse(
                res,
                500,
                false,
                "Error searching request:",
                error
              );
            }
          };

          public updateAvailablity = async(req:Request,res:Response)=>{
               try{
              const  productId = req.params._id
              const  isAvailable = req.query.availability
              console.log("_id",productId,"isAvailable",isAvailable)
              if(!productId || !isAvailable){
                sendErrorResponse(res, 400, false, "Product id  and status are required")
                return; }
                const updatedAvailability = await ProductModel.findOneAndUpdate(
                  { _id: productId,  }, // Make sure we are updating a seller
                  { $set: { availability: isAvailable } }, // Update the status field
                  { new: true } // Return the updated document
              );
              if (!updatedAvailability) {
                sendErrorResponse(res, 404, false, "Product not found or availability not updated");
                return; 
               }
               sendSuccessResponse(res, 200, true, "Product availability updated successfully", updatedAvailability);
               return;
               } 
               catch(error){
              sendErrorResponse(res, 500,false,"Error in updating availability",error)
              return;
               }
          }
        }
            
        






