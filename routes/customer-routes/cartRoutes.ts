import express from "express";
import { verifyToken } from "../../middlewares/auth.Middleware";
import { CartController } from "../../controllers/customerController/cartController";
import { authorizeRole } from "../../middlewares/role.middleware";
import { validateCart } from "../../validators/cart.validator";


const cartController = new CartController()
export const cartRoutes = express();

cartRoutes.post('/add-to-cart/:_id',verifyToken,authorizeRole('Customer'),validateCart,cartController.addProductToCart)
cartRoutes.get("/remove-productfromcart/:_id",verifyToken,authorizeRole('Customer'), cartController.removeProductFromCart);

cartRoutes.delete("/remove-cart/:_id",verifyToken,authorizeRole('Customer'), cartController.removeCart);

cartRoutes.get("/getcart",verifyToken,authorizeRole('Customer'), cartController.getCart);

// cartRoutes.put("/updateproductquantity/:productid",validateGetRequest({isPagination:false,isIdRequired:true,idType:'productid'}),validateCart,validateToken,RoleBaseValidation("add_to_cart"), cartController.updateQuantity);

