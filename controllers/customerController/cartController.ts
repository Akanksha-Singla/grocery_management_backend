import { Request, Response } from "express";
import { ProductModel } from "../../models/productModel";
import { getUserFromToken } from "../authController";
import { CartModel } from "../../models/cartModel";
import mongoose from "mongoose";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../../utils/responseUtils";

export class CartController {
  public addProductToCart = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);
      const customer_id = user?._id;

      if (!customer_id) {
        sendErrorResponse(res, 401,false, "User not authenticated");
        return;
      }

      const product_id = req.params._id;
      const { quantity_purchased } = req.body;
      console.log("quantity_purchased",quantity_purchased)

      // Find the product
      const product = await ProductModel.findById(product_id);
      console.log("product",product?.quantity)
   
      if (!product || product.availability === false) {
        sendSuccessResponse(res, 404, false,"Product not found or unavailable");
        return;
      }

      // Check stock availability
      if (quantity_purchased > product.quantity) {
        sendSuccessResponse(
          res,
          200,
          true,
          `Only ${product.quantity} units are available`
        );
        return;
      }

      // Check if the customer already has a cart
      let customerCart = await CartModel.findOne({ user_id: customer_id });

      if (!customerCart) {
        // Create a new cart for the user
        console.log("Items payload before saving:", {
          product_id: product_id,
          quantity: product.quantity,
          quantity_purchased: quantity_purchased,
          price: product.price,
          product_name: product.name,
          product_image: product.imageUrl,
        });
        customerCart = new CartModel({
          user_id: customer_id,
          items: [
            {
              product_id: new mongoose.Types.ObjectId(product_id),
              quantity:product.quantity,
              quantity_purchased: quantity_purchased,
              available_quantity: product.quantity,
              price: product.price,
              product_name: product.name,
              product_image: product.imageUrl,
            },
          ],
          total_amount: product.price * quantity_purchased,
        });
      } else {
        // Check if the product already exists in the cart
        console.log("Items payload before saving:", {
          product_id: product_id,
          quantity: product.quantity,
          quantity_purchased: quantity_purchased,
          price: product.price,
          product_name: product.name,
          product_image: product.imageUrl,
        });
        const itemIndex = customerCart.items.findIndex(
          (item) => item.product_id.toString() === product_id
        );

        if (itemIndex > -1) {
          // Update quantity if the product already exists in the cart
          customerCart.items[itemIndex].quantity_purchased += quantity_purchased;

          if (
            customerCart.items[itemIndex].quantity_purchased >
            product.quantity
          ) {
            sendSuccessResponse(
              res,
              400,
              true,
              `Only ${product.quantity} units are available`

            );
            return;
          }
        } else {
          // Add new product to the cart
          console.log("Items payload before saving:", {
            product_id: product_id,
            quantity: product.quantity,
            quantity_purchased: quantity_purchased,
            price: product.price,
            product_name: product.name,
            product_image: product.imageUrl,
          });
          customerCart.items.push({
            product_id: new mongoose.Types.ObjectId(product_id),
            quantity_purchased: quantity_purchased,
            quantity: product.quantity,
            price: product.price,
            product_name: product.name,
            product_image: product.imageUrl,
          });
        }

        // Update total amount
        customerCart.total_amount = customerCart.items.reduce(
          (sum, item) => sum + item.quantity_purchased * item.price,
          0
        );
      }
console.log("cart:",customerCart)
      // Save the cart
      await customerCart.save();
      sendSuccessResponse(res, 200, true, "Product added to cart", customerCart);
    } catch (error) {
      console.error("Error adding product to cart:", error);
      sendErrorResponse(res, 500, false,"An error occurred while adding to the cart",error);
    }
  };

  updateQuantity = async (req: Request, res: Response) => {
    try{
      const user = await getUserFromToken(req);
      const customer_id = user?._id;
      const product_id = req.params._id;
      const quantity_purchased = req.body.quantity_purchased;
      console.log(customer_id,product_id,quantity_purchased)
      if(!quantity_purchased) throw  "quantity please add quantity"
      const status = req.body.status;
      let cart = await CartModel.findOne({user_id:customer_id});
      console.log("cart:",cart)
      const product = await ProductModel.findById({_id:product_id})
      console.log("product:",product)
      if(cart && product){
       
        const itemIndex = cart.items.findIndex(
          (item) =>
            JSON.stringify(item.product_id) == JSON.stringify(product_id)
        );
        
        if (itemIndex >=0 ) {
          
          
          cart.items[itemIndex].quantity_purchased = quantity_purchased;
          
        
          
            if(cart.items[itemIndex].quantity_purchased==0) {
              cart.items.splice(itemIndex, 1);
            }
          
          if (
            cart.items[itemIndex].quantity_purchased>
           product.quantity
          ){
            sendSuccessResponse(res, 200, true, `only ${product.quantity}  are available`);
            return;
        } 
        } else {
           
          cart.items.push({
            product_id: new mongoose.Types.ObjectId(product_id),
            quantity_purchased: quantity_purchased,
            quantity: product.quantity,
            price: product.price,
            product_name: product.name,
            product_image: product.imageUrl,
          });
        }

        cart.total_amount = cart.items.reduce(
          (sum, item) => sum + item.quantity_purchased * item.price,
          0
        );
        console.log(cart);
        
        await cart.save();
        sendSuccessResponse(res, 200, true, "product added to cart", cart);

      }
    }catch(error){
      sendErrorResponse(res, 500, false, "Internal server error", error);

    }
  }

  public removeProductFromCart = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);
      const customer_id = user?._id;
      const product_id = req.params._id;

      const product = (await ProductModel.findById(
        product_id
      ).exec()) 
      if (product?.availability== false || !product) {
        sendSuccessResponse(res, 200, true, "product item not found");
      }else{

   
      let cart = await CartModel.findOne({
       user_id: customer_id,
      });

      if (cart) {
        const itemIndex = cart.items.findIndex(
          (item) => JSON.stringify(item.product_id) == JSON.stringify(product_id)
        );

        if (itemIndex > -1) {
          cart.items.splice(itemIndex, 1);
          cart.total_amount = cart.items.reduce(
            (sum, item) => sum + item.quantity * item.price,
            0
          );

          await cart.save();
          if (cart.items.length === 0) {
            const remove = await CartModel.findByIdAndDelete(cart._id);
          }
          sendSuccessResponse(res, 200, true, "Product removed from cart", cart);
        } else {
          sendSuccessResponse(res, 200, true, "Product item not found in cart");
        }
      } else {
        sendSuccessResponse(
          res,
          200,
          true,
          "Cart not found for  customer"
        );
      }}
    } catch (error) {
      sendErrorResponse(res, 500, false, "Internal server error", error);
    }
  };

  public removeCart = async (req: Request, res: Response) => {
    try {
      const cartId = req.params._id;
      const cart = await CartModel.findById(cartId).exec();
      if (cart) {
        const removeCart = await CartModel.deleteOne({ _id: cartId });
        sendSuccessResponse(res, 200, true, "Cart Removed", removeCart);
      } else {
        sendSuccessResponse(res, 200, true, "Cart not found");
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, "Internal server error", error);
    }
  };

  public getCart = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);
      if (user) {
        const userId = user._id;

        const cart = await CartModel.find({ user_id: userId });
        if (cart.length > 0) {
          sendSuccessResponse(res, 200, true, "Cart loaded successfully", cart);
        } else {
          sendSuccessResponse(res, 200, true, "Cart not found");
        }
      } else {
        sendSuccessResponse(res, 200, true, "Customer not found");
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, "Internal server error", error);
    }
  };
  
}
