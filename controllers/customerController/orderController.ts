import {Request,Response} from "express";
import { CartController } from "./cartController";
import { CartModel } from "../../models/cartModel";
import { OrderModel } from "../../models/orderModel";
import {
    sendErrorResponse,
    sendSuccessResponse,
  } from "../../utils/responseUtils";
import { ProductModel } from "../../models/productModel";  
import { getUserFromToken } from "../authController";
export class OrderController {
    // Place a new order
    public placeOrder = async (req: Request, res: Response) => {
        const { cartId } = req.params;
        const { address, paymentMode } = req.body;
          console.log("cartId:",cartId,address, paymentMode)
      try {
        const { cartId } = req.params;
        const { address, paymentMode } = req.body;
          console.log("cartId:",cartId,address, paymentMode)

        // Validate payment mode
        if (!["CoD", "UPI"].includes(paymentMode)) {
          sendErrorResponse(
            res,
            400,
            false,
            "Invalid payment mode. Accepted values are 'CoD' or 'UPI'."
          );
          return;
        }
  
        const cart = await CartModel.findById({_id:cartId});
        if (!cart || cart.items.length === 0) {
           sendErrorResponse(res, 400, false, "Cart not found or empty");
           return;
        }
         console.log("cart",cart)
        // Deduct inventory for each product in the cart
        await Promise.all(
          cart.items.map(async (item) => {
            console.log("pId",item.quantity)
            await ProductModel.findByIdAndUpdate({_id:item.product_id}, {
               $inc: { quantity: -item.quantity_purchased }
            });

          })
        );
  
        // Calculate total price
        const totalPrice = cart.items.reduce(
          (sum, item) => sum + item.quantity_purchased * item.price,
          0
        );
        console.log(totalPrice)
        // Create new order
        const order = new OrderModel({
          userId: cart.user_id,
          items: cart.items.map((item) => ({
            productId: item.product_id,
            quantity_purchased: item.quantity_purchased,
            price: item.price,
            productName:item.product_name
          })),
          totalPrice,
          address,
          paymentStatus: paymentMode === "CoD" ? "paid" : "pending",
          orderStatus: "pending",
        });
        console.log(order)
  
        await order.save();
        await CartModel.findByIdAndDelete(cartId); // Clear the cart after placing the order
        sendSuccessResponse(res, 201, true, "Order placed successfully", order);
        return;
      } catch (error) {
        sendErrorResponse(res, 500, false, `Internal server error: ${error}`);
        return;
      }
    };
  
    // Confirm payment for an order
    public confirmPayment = async (req: Request, res: Response) => {
      try {
        const { orderId } = req.params;
  
        const order = await OrderModel.findById(orderId);
        if (!order) {
          return sendErrorResponse(res, 404, false, "Order not found");
        }
  
        if (order.orderStatus === "cancelled") {
          return sendErrorResponse(res, 400, false, "Order is already cancelled");
        }
  
        // Update payment and delivery status based on the current state
        const updatedOrder = await OrderModel.findByIdAndUpdate(
          orderId,
          {
            paymentStatus: "paid",
            orderStatus: order.paymentStatus === "paid" ? "delivered" : "pending",
          },
          { new: true }
        );
  
        sendSuccessResponse(res, 200, true, "Payment confirmed", updatedOrder);
      } catch (error) {
        sendErrorResponse(res, 500, false, `Internal server error: ${error}`);
      }
    };
  
    // Get order by ID
    public getOrderById = async (req: Request, res: Response) => {
      try {
        const { orderId } = req.params;
  
        const order = await OrderModel.findById(orderId)
          .populate("items.productId")
          .populate("address")
          .exec();
  
        if (!order) {
          return sendErrorResponse(res, 404, false, "Order not found");
        }
  
        sendSuccessResponse(res, 200, true, `Order details for ID: ${orderId}`, order);
      } catch (error) {
        sendErrorResponse(res, 500, false, `Internal server error: ${error}`);
      }
    };

    public getAllOrders = async(req:Request,res:Response)=>{
try{
  const user = await getUserFromToken(req)
  const _id = user?._id
  const role = user?.role 
  const {status} = req.query
  if(role === 'Seller'){
  const orders = await OrderModel.find()
sendSuccessResponse(res,200,true,'orders fetched',orders)
  }
  else if(role === 'Customer'){
    const orders = await OrderModel.find({user_id:_id})
    sendSuccessResponse(res,200,true,'orders fetched',orders)
  }

}catch(error){
  sendErrorResponse(res, 500, false, `Internal server error: ${error}`);
}
    }
  }

