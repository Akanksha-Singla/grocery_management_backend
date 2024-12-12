import mongoose, { Document } from "mongoose";

export interface ICartItem {
  product_id: mongoose.Types.ObjectId;
  quantity_purchased: number;
  quantity: number;
  price: number;
  product_name: string;
  product_image?: string;
}

export interface ICart extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  user_id: mongoose.Schema.Types.ObjectId;
  // product_id:mongoose.Schema.Types.ObjectId;
  total_amount: number;
  items: ICartItem[];
  isActive: boolean;
}

export const CartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  //  quantity_purchased: { type: Number, required: true },
    items: [
      {
        product_id: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity_purchased: { type: Number, required: true, min: 1 },
        quantity: { type: Number },
        price: { type: Number, required: true },
        product_name: { type: String, required: true },
        product_image: { type: String },
      },
    ],
    total_amount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);
export const CartModel = mongoose.model<ICart>("Cart", CartSchema);
