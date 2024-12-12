import express, { Request, Response } from 'express';
import { verifyToken } from '../../middlewares/auth.Middleware';
import { authorizeRole } from '../../middlewares/role.middleware';
import{ProductController} from '../../controllers/seller-contoller/productController'
import { upload, uploadToCloudinary } from '../../config/cloudinaryConfig';
import { validateCreateProduct } from '../../validators/product.validator';


export const productRoutes = express();
export const productController = new ProductController()
productRoutes.post('/addProduct',verifyToken,authorizeRole("Seller"),validateCreateProduct,productController.addProduct)
productRoutes.get('/getAllProducts',verifyToken,authorizeRole("Seller","Customer"),productController.getAllProducts)
productRoutes.get('/getProductById/:_id',verifyToken,authorizeRole("Seller","Customer"),productController.getProductById)
productRoutes.get('/getProductByCategory/:categoryId',verifyToken,authorizeRole("Seller","Customer"),productController.getProductsByCategory)
productRoutes.delete('/deleteProduct/:_id',verifyToken,authorizeRole("Seller"),productController.deleteProduct)
productRoutes.put('/updateProduct/:_id',verifyToken,authorizeRole("Seller"),validateCreateProduct,productController.updateProduct)
productRoutes.get('/search',verifyToken,authorizeRole("Seller"),productController.searchProduct)
productRoutes.patch('/updateAvailability/:_id',verifyToken,authorizeRole('Seller'),productController.updateAvailablity);
productRoutes.post("/uploadProductImage", upload.single('recfile'), uploadToCloudinary("user_image"));
