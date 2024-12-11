import mongoose from "mongoose";

// import dotenv from 'dotenv';
// dotenv.config();

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
// if(process.env.MONGODB_URL)
// mongoose
//   .connect(process.env.MONGODB_URL)
//   .then((success) => {
//     console.log("connect,connected.....");
//   })
//   .catch((err) => console.log(err));
