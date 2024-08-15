import { NextApiRequest,NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import bcrypt from "bcrypt";
import { UserModel } from "@/models/user";
import { sendVerififcationEmail } from "@/helpers/sendVerificationEmail";

type ResponseData = {
    message: string
  }

export async function POST(req:Request){
    await dbConnect();

    try{
        const {email,username,password}=await req.json();
        const user=await UserModel.findOne({
            username,
            isVerified:true
        });

        if(user) return Response.json({
            success:false,
            message:"Username already in use!"
        },{status:400});

        const userByEmail=await UserModel.findOne({
            email,
        });

        const verifyCode= Math.floor(100000+ Math.random()*900000).toString();

        if(userByEmail){
            if(userByEmail.isVerified){
                return Response.json({
                    success:false,
                    message: "User already exists with this email"
                },{status:400})
            }
            else{
                const hashedPassword=await bcrypt.hash(password,10);
                userByEmail.password=hashedPassword;
                userByEmail.verifyCode=verifyCode;
                userByEmail.verifyCodeExpiry=new Date(Date.now()+3600000);
                await userByEmail.save();
            }
        }
        else{
            const expiryDate=new Date();
            expiryDate.setHours(expiryDate.getHours()+1);
            const hashedPassword=await bcrypt.hash(password,10);
            const newUser=new UserModel({
                email,
                username,
                password:hashedPassword,
                verifyCode,
                verifyCodeExpiry:expiryDate
            });
            await newUser.save();
        }

        const emailResponse =await sendVerififcationEmail(
            email,
            username,
            verifyCode
        )

        if(!emailResponse.success){
            return Response.json({
                success:false,
                message: emailResponse.message
            },{status:500})
        }

        return Response.json({
            success:true,
            message: "Verification email sent successfully!"
        },{status:200})
    }catch(err){
        return Response.json({success:false,message:{err}});
    }
}