import express from 'express';
import dotenv from 'dotenv';
import "./config/mongoDBConfig";
import { authRoutes } from './routes/authRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { sellerRoutes } from './routes/sellerRoutes';
import { customerRoutes } from './routes/customerRoutes';
import { roleRoutes } from './routes/roleRoutes';
import cors from "cors"

const app = express();
dotenv.config();
const port = process.env.PORT

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT}`);
});

app.use('/api/auth',authRoutes);
app.use('/api/seller',sellerRoutes);
app.use('/api/admin',adminRoutes);
app.use('/api/customer',customerRoutes);
app.use('/api/seller',sellerRoutes);
app.use('/api/role',roleRoutes)

app.get('/', (req, res) => {
  res.send('Hello, World!');
});


  