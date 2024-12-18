import express from "express";
import { verifyToken } from "../../middlewares/auth.Middleware";
// import { OrderController } from "../../controllers/customerController/orderController";
import { ShippingAddressController } from "../../controllers/customerController/addressController";
import { authorizeRole } from "../../middlewares/role.middleware";
import { validateCart } from "../../validators/cart.validator";



const shippingAddressController  = new ShippingAddressController ()
export const shippingRoutes = express();

shippingRoutes.post('/add-address',verifyToken,authorizeRole('Customer'),shippingAddressController.addShippingAddress)
shippingRoutes.get('/getAllLocation',verifyToken,authorizeRole('Customer'),shippingAddressController.getAllShippingAddresses)

