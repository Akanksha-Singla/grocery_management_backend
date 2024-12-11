import mongoose,{Document} from "mongoose"

export interface IProduct {
    _id?: mongoose.Schema.Types.ObjectId; // Optional since it is automatically generated by MongoDB
    name: string;
    description?: string;   // Optional field
    category:string; // Can be an ObjectId if referencing Category or string for enums
    price: number;
    quantity: number;
    imageUrl?: string;      // Optional field
    availability: boolean;
    sellerId?: mongoose.Schema.Types.ObjectId;  // Reference to User model
    rating: number;          // Default value: 0
    totalReviews: number;    // Default value: 0
    createdAt?: Date;        // Automatically assigned, so it's optional
  }
  
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, 
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    imageUrl: { type: String },
    availability: { type: Boolean, default: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    },{
        timestamps:true
    });
  
  export const ProductModel = mongoose.model<IProduct>('Product', productSchema);