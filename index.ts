import express from 'express';
import dotenv from 'dotenv';
import { dbConnect } from './config/mongoDBConfig';
import "./config/mongoDBConfig";//function instad of direct import
import { authRoutes } from './routes/authRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { sellerRoutes } from './routes/seller-routes/sellerRoutes';
import { customerRoutes } from './routes/customerRoutes';
import { roleRoutes } from './routes/roleRoutes';
import { categoryRoutes } from './routes/seller-routes/catregoryRoutes';
import { productRoutes } from './routes/seller-routes/productRoutes';
import { cartRoutes } from './routes/customer-routes/cartRoutes';
import cors from "cors"

const app = express();
// dotenv.config();
const port = process.env.PORT

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT}`);
});
dbConnect()
.then(()=>{
  //index routes file 
  app.use('/api/auth',authRoutes);
  app.use('/api/seller',sellerRoutes);
  app.use('/api/admin',adminRoutes);
  app.use('/api/customer',customerRoutes);
  app.use('/api/seller',sellerRoutes);
  app.use('/api/seller/category',categoryRoutes);
  app.use('/api/seller/product',productRoutes);
  app.use('/api/role',roleRoutes);
  app.use('/api/customer/cart',cartRoutes)
  
  app.get('/', (req, res) => {
    res.send('Hello, World!');
  });
}).catch((error)=>{
  console.log('Failed to connect mongo')
});


  