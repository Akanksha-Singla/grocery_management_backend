import mongoose from "mongoose";

 export const dbConnect = async()=>{
  if(process.env.MONGODB_URL){
    try{
     const connection = await mongoose.connect(process.env.MONGODB_URL)
     console.log("connect,connected.....");
    }
    catch(error){
      console.log("cant connect with db",error)
      throw new Error("Failed to connect mongo")
    }
  }
  else{
    console.log("can't find mongourl")
  }
  
 }
