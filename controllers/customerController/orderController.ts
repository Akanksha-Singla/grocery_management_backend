import { Request, Response } from "express";
import { CartModel } from "../../models/cartModel";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import { OrderModel } from "../../models/orderModel";
import { PaymentStatus, OrderStatus, PaymentMode } from "../../utils/enumUtils";
import { ProductModel } from "../../models/productModel";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../../utils/responseUtils";
import { getUserFromToken } from "../authController";
dotenv.config();
export class OrderController {
  // Place a new order
  private razorpay: Razorpay;
  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZOR_PAY_KEY_ID!,
      key_secret: process.env.RAZOR_PAY_KEY_SECRET!,
    })
  }

  public placeOrder = async (req: Request, res: Response) => {
    const { cartId } = req.params;
    const { address } = req.body;
    console.log("place order")

    try {
      // Validate payment mode using Enum
      // if (!Object.values(PaymentMode).includes(paymentMode)) {
      //   sendErrorResponse(
      //     res,
      //     400,
      //     false,
      //     `Invalid payment mode. Accepted values are '${PaymentStatus.Pending}' or '${PaymentStatus.Paid}'.`
      //   );
      //   return;
      // }

      const cart = await CartModel.findById(cartId);
      if (!cart || cart.items.length === 0) {
        sendErrorResponse(res, 400, false, "Cart not found or empty");
        return;
      }
      console.log(cart)
      // Deduct inventory for each product
      await Promise.all(
        cart.items.map(async (item) => {
          await ProductModel.findByIdAndUpdate(item.product_id, {
            $inc: { quantity: -item.quantity_purchased },
          });
        })
      );

      // Calculate total price
      const totalPrice = cart.items.reduce(
        (sum, item) => sum + item.quantity_purchased * item.price,
        0
      );
      console.log("total price", totalPrice)
      // Create Razorpay order

      const razorpayOrder = await this.razorpay.orders.create({
        amount: Math.ceil(totalPrice) * 100,// Convert to paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      })

      // Create new order
      const order = new OrderModel({
        userId: cart.user_id,
        items: cart.items.map((item) => ({
          productId: item.product_id,
          quantity_purchased: item.quantity_purchased,
          price: item.price,
          productName: item.product_name,
        })),
        totalPrice,
        address,
        // paymentStatus:
        // paymentMode === "UPI" ? PaymentStatus.Paid : PaymentStatus.Pending,
        orderStatus: OrderStatus.Pending,
        razorpayOrderId: razorpayOrder.id,
      });

      console.log("order", order)
      await order.save();
      await CartModel.findByIdAndDelete(cartId); // Clear cart

      // sendSuccessResponse(res, 201, true, "Order placed successfully", order);
      sendSuccessResponse(res, 201, true, "Order placed successfully", { order, razorpayOrder });
    } catch (error) {
      sendErrorResponse(res, 500, false, `Internal server error: ${error}`);
    }
  };

  // Confirm payment for an order
  public confirmPayment = async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      // const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;


      const order = await OrderModel.findById(orderId);
      if (!order) {
        sendErrorResponse(res, 404, false, "Order not found");
        return;
      }

      if (order.orderStatus === OrderStatus.Cancelled) {
        sendErrorResponse(
          res,
          400,
          false,
          "Order is already cancelled"
        );
      }

      // Update payment and order status
      const updatedOrder = await OrderModel.findByIdAndUpdate(
        orderId,
        {
          paymentStatus: PaymentStatus.Paid,
          orderStatus:
            order.paymentStatus === PaymentStatus.Paid
              ? OrderStatus.Delivered
              : OrderStatus.Pending,
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
        .populate("address", "street")
        .populate('user', "username")
        .exec();

      if (!order) {
        return sendErrorResponse(res, 404, false, "Order not found");
      }

      sendSuccessResponse(
        res,
        200,
        true,
        `Order details for ID: ${orderId}`,
        order
      );
    } catch (error) {
      sendErrorResponse(res, 500, false, `Internal server error: ${error}`);
    }
  };


  public getAllOrders = async (req: Request, res: Response) => {
    try {
      const user = await getUserFromToken(req);
      const _id = user?._id;
      const role = user?.role;

      const status = req.query.status as string;
      const page = parseInt(req.query.page as string) || 1; // Default page to 1
      const limit = parseInt(req.query.limit as string) || 10; // Default limit to 10

      if (page < 1 || limit < 1) {
        sendErrorResponse(res, 400, false, "Page and limit must be positive integers");
        return;
      }

      const skip = (page - 1) * limit; // Pagination skip logic
      let orders = [];
      let totalItems = 0;
      let totalPages = 0;

      if (role === "Seller") {
        // For Seller, fetch all orders (filter by status if provided)
        const query: any = status ? { orderStatus: status } : {};

        orders = await OrderModel.find(query)
          .populate("address", "street")
          .populate("userId", "username email")

          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec();

        totalItems = await OrderModel.countDocuments(query);
        totalPages = Math.ceil(totalItems / limit);

        sendSuccessResponse(res, 200, true, `All orders fetched`, orders, {
          currentPage: page,
          totalPages,
          totalItems,
        });
      } else if (role === "Customer") {
        // For Customer, fetch orders belonging to their user ID
        const query: any = { userId: _id };
        if (status) query.orderStatus = status; // Add status filter if provided

        orders = await OrderModel.find(query)
          .populate("address", "street")
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec();

        totalItems = await OrderModel.countDocuments(query);
        totalPages = Math.ceil(totalItems / limit);

        sendSuccessResponse(res, 200, true, `Your orders fetched`, orders, {
          currentPage: page,
          totalPages,
          totalItems,
        });
      } else {
        sendErrorResponse(res, 403, false, "Unauthorized access");
      }
    } catch (error) {
      sendErrorResponse(res, 500, false, `Internal server error: ${error}`);
    }
  };

}
