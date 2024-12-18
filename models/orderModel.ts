import mongoose, { Schema, Document } from 'mongoose';
import { ICart,CartSchema } from './cartModel';
import { PaymentStatus } from '../utils/enumUtils';
import { OrderStatus } from '../utils/enumUtils';

interface IOrderItem {
  productName:string;
  productId: mongoose.Types.ObjectId; // Reference to Product
  quantity_purchased: number; // Quantity of the product
  price: number; // Price at the time of purchase
}

interface Order extends Document {
  userId: mongoose.Types.ObjectId; // Reference to User
  items: IOrderItem[]; // Array of purchased items
  totalPrice: number; // Total price of the order
  address: mongoose.Types.ObjectId; // Reference to User Address
  paymentStatus: PaymentStatus; // Payment status: 'pending', 'completed', 'failed'
  orderStatus: OrderStatus; // Order status: 'pending', 'shipped', 'delivered', 'cancelled'
  razorpayOrderId:string;
  createdAt: Date; // Order creation time
  updatedAt: Date; // Order last updated time

}

const OrderSchema = new Schema<Order>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity_purchased: { type: Number, required: true },
      price: { type: Number, required: true },
      productName:{type:String,required:true}
    },
  ],
  totalPrice: { type: Number, required: true },
  razorpayOrderId:{type:String},
  address: { type: Schema.Types.ObjectId, ref: 'Address', required: true },
   paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus), // Use enum values
      default: PaymentStatus.Pending,
    },
    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus), // Use enum values
      default: OrderStatus.Pending,
    },
 
},{
    timestamps:true
});

OrderSchema.pre('save', function (next) {
  this.updatedAt = new Date(); // Update timestamp
  next();
});

export const OrderModel = mongoose.model<Order>('Order', OrderSchema);
