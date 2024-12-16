import mongoose, { Schema, Document } from 'mongoose';

interface IAddress extends Document {
  user_id: mongoose.Types.ObjectId; // Reference to User
  label: string; // Label for address (e.g., "Home", "Office")
  street: string; // Street address
  city: string; // City
  state: string; // State/Region
  postalCode: string; // Postal/ZIP code
 isDefault: boolean; // Mark default address for quick selection
}

const ShippingAddressSchema = new Schema<IAddress>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  label: { type: String, default: 'Home' },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

export const ShippingAddressModel = mongoose.model<IAddress>('Address',  ShippingAddressSchema);
