import { NextApiRequest,NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";

export async function POST(req:NextApiRequest,res:NextApiResponse){
    await dbConnect();

    

}