import mongoose from "mongoose";

export interface IReview extends Document {
  tiffin_id: mongoose.Schema.Types.ObjectId;
  customer_id: mongoose.Schema.Types.ObjectId;
  rating: number;
 
}

const ReviewSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TiffinItem",
    required: true,
  },
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: { type: Number, required: true },
  
},{
    timestamps:true
});

export const ReviewModel = mongoose.model<IReview>("Review", ReviewSchema);
