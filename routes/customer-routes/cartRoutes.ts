import express from "express";
import { verifyToken } from "../../middlewares/auth.Middleware";
import { CartController } from "../../controllers/customerController/cartController";
import { authorizeRole } from "../../middlewares/role.middleware";
import { validateCart } from "../../validators/cart.validator";



const cartController = new CartController()
export const cartRoutes = express();

cartRoutes.post('/add-to-cart/:_id',verifyToken,authorizeRole('Customer'),validateCart,cartController.addProductToCart)


cartRoutes.delete("/remove-cart/:_id",verifyToken,authorizeRole('Customer'), cartController.removeCart);

cartRoutes.get("/getcart",verifyToken,authorizeRole('Customer'), cartController.getCart);

cartRoutes.put("/updateproductquantity/:_id",verifyToken,authorizeRole('Customer'),cartController.updateQuantity);
cartRoutes.delete("/removeProduct/:_id",verifyToken,authorizeRole('Customer'),cartController.removeProductFromCart);

