import mongoose, { Schema, Document } from 'mongoose';

interface IOrderItem {
  productId: mongoose.Types.ObjectId; // Reference to Product
  quantity: number; // Quantity of the product
  price: number; // Price at the time of purchase
}

interface Order extends Document {
  userId: mongoose.Types.ObjectId; // Reference to User
  items: IOrderItem[]; // Array of purchased items
  totalPrice: number; // Total price of the order
  address: mongoose.Types.ObjectId; // Reference to User Address
  paymentStatus: string; // Payment status: 'pending', 'completed', 'failed'
  orderStatus: string; // Order status: 'pending', 'shipped', 'delivered', 'cancelled'
  createdAt: Date; // Order creation time
  updatedAt: Date; // Order last updated time
}

const OrderSchema = new Schema<Order>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  totalPrice: { type: Number, required: true },
  address: { type: Schema.Types.ObjectId, ref: 'Address', required: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
 
},{
    timestamps:true
});

OrderSchema.pre('save', function (next) {
  this.updatedAt = new Date(); // Update timestamp
  next();
});

export const OrderModel = mongoose.model<Order>('Order', OrderSchema);
