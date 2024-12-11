
import mongoose from "mongoose"


export interface ICategory{
    name:string,
    description?:string
}

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String }
},{
    timestamps:true
});

export const CategoryModel = mongoose.model<ICategory>('Category', categorySchema);