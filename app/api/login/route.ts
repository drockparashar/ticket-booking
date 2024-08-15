import { NextApiRequest,NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import bcrypt from "bcrypt";
import { UserModel } from "@/models/user";

export async function POST(req:NextApiRequest,res:NextApiResponse){
    await dbConnect();

    const {username,password}=req.body();
    try{
        const user=await UserModel.findOne({username});
        if(!user) return res.status(401).json({message:"Invalid Userame"});
        const isValidPassword= await bcrypt.compare(password,user.password);
    }catch(err){
        return res.status(400).json({err});
    }
}