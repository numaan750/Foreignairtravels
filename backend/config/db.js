import mongoose from "mongoose";


const connectDB = async () =>{
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("✅ Connected to MongoDB")
    }catch(error){
        console.log("mongoose connection error", error);
        process.exit(1);
    }
} 


export default connectDB;
