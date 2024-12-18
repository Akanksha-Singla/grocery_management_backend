import mongoose,{Document} from "mongoose"
import { IRole} from "./roleModel";
import { UserStatus } from "../utils/enumUtils";





export interface IUser extends Document{
_id:mongoose.Schema.Types.ObjectId;
user_image:string;
username: string;
password: string;
email: string;
contact_number: string;
address: string;
role_id: mongoose.Schema.Types.ObjectId;
role:string;
role_specific_details:any;
status:string;
refreshToken?:string

// resetPasswordToken: string| undefined;
// resetPasswordTokenExpires: Date | undefined;
}

const UserSchema = new mongoose.Schema({
    user_image: {type: String},
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contact_number: { type: String, required: true },
    address: { type: String, required: true },
    role_id: { type: mongoose.Schema.Types.ObjectId,  required: true },
    role:{
        type:String,
        required:true,
        ref:"Role"},
    role_specific_details:{} ,
    refreshToken: { type: String },
    status:{
      type:String, //enum
      enum: Object.values(UserStatus),
      default:UserStatus.Pending
    }
    //isActive:{ type: Boolean, required: true, default:true },
},{
  timestamps:true
});

export const UserModel = mongoose.model<IUser>("User", UserSchema);
