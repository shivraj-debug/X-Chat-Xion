import express from "express"
import dotenv from "dotenv"
import userRoutes from "./routes/userRoutes"
import chatRoute from "./routes/chatRoute"
import cors from "cors"
import connectDB from "./config/db"
import cookieParser from "cookie-parser";
// import {app,server} from "../src/socket/socket"

const app=express();

app.use(cookieParser());
app.use(express.json())
dotenv.config();

// connect to mongoDB
connectDB();

// for put user field in Request so that we can access id from there
declare module 'express' {
  interface Request {
    user?: {
      id: string;
    };
  }
}
app.use(
    cors({
      origin: "https://x-chat2.vercel.app", 
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true, 
    })
  );

  app.options('*', cors());

app.use("/api/user",userRoutes)
app.use("/api/chat",chatRoute)

const port=process.env.PORT || 8000

app.listen(port,()=>{
    console.log(`server is running on ${port}`)
})

