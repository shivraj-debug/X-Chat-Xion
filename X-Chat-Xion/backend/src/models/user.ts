import mongoose, { Document, Schema } from "mongoose";

export interface Iuser extends Document{
    email:string,
    name:string,
    xion_id:string,
    dailyMessages: number,
    lastMessageDate: Date,
    plan:string,
    timestamps:Date,
}

 const userSchema=new Schema<Iuser>({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true
    },
    xion_id:{
        type:String,
        required:true,
        unique:true,
    },
    dailyMessages:{
        type:Number,
        default:0
    },
    lastMessageDate:{
        type:Date,
        default:Date.now
    },
    plan:{
        type:String,
    }
 },{
    timestamps:true
 })

 const User=mongoose.model<Iuser>("User",userSchema)

 export  default User

