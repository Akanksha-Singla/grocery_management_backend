import express from "express";
import { verifyToken } from "../../middlewares/auth.Middleware";
import { OrderController } from "../../controllers/customerController/orderController";
import { authorizeRole } from "../../middlewares/role.middleware";
import { validateCart } from "../../validators/cart.validator";



const orderController = new OrderController()
export const orderRoutes = express();

orderRoutes.post('/place-order/:cartId',verifyToken,authorizeRole('Customer'),validateCart,orderController.placeOrder)

