import express from "express";
import { verifyToken } from "../../middlewares/auth.Middleware";
import { OrderController } from "../../controllers/customerController/orderController";
import { authorizeRole } from "../../middlewares/role.middleware";
import { validateCart } from "../../validators/cart.validator";
import { verify } from "crypto";
import { validateOrder } from "../../validators/order.validator";


const orderController = new OrderController()
export const orderRoutes = express();

orderRoutes.post('/place-order/:cartId',verifyToken,authorizeRole('Customer'),validateOrder,orderController.placeOrder);
orderRoutes.get('/get-all',verifyToken,verifyToken,authorizeRole('Customer','Seller'),orderController.getAllOrders);
orderRoutes.get('/confirmPayment/:orderId',verifyToken,authorizeRole('Seller'),orderController.confirmPayment)

