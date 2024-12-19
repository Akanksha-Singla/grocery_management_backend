import {sendSuccessResponse,sendErrorResponse,sendSuccessToken} from "../../utils/responseUtils"
import { Request, Response } from "express";
import { IProduct,ProductModel} from "../../models/productModel";
import { ObjectId } from "mongodb";
import { UserModel } from "../../models/userModel";
import jwt from "jsonwebtoken";
import { IUser } from "../../models/userModel";
import { getUserFromToken } from "../authController";

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
              imageUrl
              } = req.body
            const newProduct = new ProductModel({
              name,
              description,
              category,
              price,
              quantity,
              availability,
              imageUrl
               });
          
              await newProduct.save();
              sendSuccessResponse(res, 201, true, "Product added successfully", newProduct);
        }
        catch(error){
            sendErrorResponse(res, 400, false, `Failed to add product ${error}`, error);
        }}

        public getProductsByCategory = async (req: Request, res: Response) => {
          try {
           
            const userToken = await getUserFromToken(req);
              const role = userToken?.role
              const _id =userToken?._id
        
            console.log("Role",role);
        
            const user = (await UserModel.findOne({ _id:_id }).exec()) as IUser;
        
            const { categoryId } = req.params;
            console.log("categoryId", categoryId);
        
            let products;
        
            // Fetch products based on user role
            if (role === "Seller") {
              products = await ProductModel.find({ category: categoryId }).populate(
                "category",
                "name description"
              );
            } else if (role === "Customer") {
              products = await ProductModel.find({ category: categoryId, availability: true }).populate(
                "category",
                "name description"
              );
            } else {
               sendErrorResponse(res, 403, false, "Forbidden: Invalid user role");
               return
            }
        
            // Handle case where no products are found
            if (!products || products.length === 0) {
               sendSuccessResponse(res, 200, true, "No product found in this category");
               return
            }
        
            // Send success response with products
             sendSuccessResponse(res, 200, true, "Products in this category", products);
             return
          } catch (error) {
            console.error("Error fetching products by category:", error);
             sendErrorResponse(res, 400, false, `Failed to fetch products`, error);
             return
          }
        };
        
         
          public getProductById = async (
            req: Request,
            res: Response
          ): Promise<void> => {
            try {
              const user = await getUserFromToken(req);
              const role = user?.role
               const {_id} = req.params;
              console.log("id",_id)

              if(role === 'Seller'){  const product = await ProductModel.findOne({
                _id: _id,
               }).populate('category', 'name description');
        
              if (!product) throw "Product not found"
              sendSuccessResponse(res, 200, true, "product", product);}
              if(role === 'Customer'){
                const product = await ProductModel.findOne({
                  _id: _id,
                  availability:true
                 }).populate('category', 'name description');
          
                if (!product) throw "Product not found"
                sendSuccessResponse(res, 200, true, "product", product);
              }
            
            } catch (error) {
              sendSuccessResponse(res, 500, false, "Error fetching Product", error);
            }
          };

          public getAllProducts = async (
            req: Request,
            res: Response
          ): Promise<void> => {
            try {
        
          const user = await getUserFromToken(req);
          const role = user?.role
           const {_id} = req.params;
          console.log("id",_id)


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
                if(role === 'Seller'){  const products= await ProductModel.find().populate('category', 'name description')
                  .sort({updated_at:-1})  
                  .skip(skip)
                  .limit(limit);
          
                  totalItems = await ProductModel.countDocuments({});
          
                  totalPages = Math.ceil(totalItems / limit);
                  sendSuccessResponse(res, 200, true, "All Products", products, {
                    currentPage: page,
                    totalPages: totalPages,
                    totalItems: totalItems,
                  });}
                  if(role ==='Customer'){ 
                     const products= await ProductModel.find({availability:true}).populate('category', 'name description')
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
         
          public searchProduct = async (req: Request, res: Response): Promise<void> => {
            try {
            
              
              const user = await getUserFromToken(req);
              const role = user?.role
               const {_id} = req.params;
              console.log("id",_id)
    
              const { query } = req.query;
              if (!query || typeof query !== "string") {
                 sendErrorResponse(res, 400, false, "Query parameter is required and must be a string");
                 return;
              }
          
              const searchFields = ["name", "description"];
              let products: IProduct[] = [];
          
              // Fetch products based on user role and search query
              for (let field of searchFields) {
                if (role === "Seller") {
                  products = await ProductModel.find({
                    [field]: { $regex: query, $options: "i" },
                  })
                    .populate("category", "name description")
                    .exec();
                } else if (role === "Customer") {
                  products = await ProductModel.find({
                    [field]: { $regex: query, $options: "i" },
                    availability: true, // Only available products for customers
                  })
                    .populate("category", "name description")
                    .exec();
                } else {
                  sendErrorResponse(res, 403, false, "Forbidden: Invalid user role");
                  return
                }
          
                // Stop searching if products are found
                if (products.length > 0) break;
              }
          
              // Handle case where no products match the query
              if (products.length === 0) {
                 sendSuccessResponse(
                  res,
                  200,
                  true,
                  "No products found matching the search criteria",
                  products
                );
                return;
              }
          
              // Send success response with products
               sendSuccessResponse(res, 200, true, "Search results", products);
               return
            } catch (error) {
              console.error("Error searching products:", error);
               sendErrorResponse(
                res,
                500,
                false,
                `Failed to perform search`,
                error
              );
              return
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
            
        






