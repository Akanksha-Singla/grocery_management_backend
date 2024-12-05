import mongoose from "mongoose";

export interface IPermission {
  request: string;
  url: string;
}

export interface IRole extends Document {
  _id:mongoose.Schema.Types.ObjectId;
  role_name: string;
  role_permission: string[];
  role_specific_details: any;
}

const PermissionSchema = new mongoose.Schema({
  request: { type: String, required: true },
  url: { type: String, required: true },
});

const RoleSchema = new mongoose.Schema({
  role_name: { type: String, required: true },
  role_permission: { type: [String], required: true },
  role_specific_details: { type: [], require: true },
  isActive: { type: Boolean, required: true, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export const RoleModel = mongoose.model<IRole>("Role", RoleSchema);
