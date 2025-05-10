import express from "express";
import mongoose from "mongoose";
import {UserModel,LinkModel,ContentModel} from "./db";
import jwt from "jsonwebtoken"
import cors from "cors";
import { JWT_PASSWORD } from "./config";


const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/v1/signup",async(req,res) => {

    const { username, password }: { username: string; password: string } = req.body;

    try{
        await UserModel.create({
            username: username,
            password: password
        })
        res.status(201).json({
            message: "User created successfully"
        })

    } catch(err){
        res.status(411).json({
            message: "User already exists"
        })
    }
})
        



    
app.post("/api/v1/signin",async(req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    const ExistingUser = await UserModel.findOne({
        username:username,
        password:password
    })
    if(!ExistingUser){
        res.status(403).json({
            message:"Invalid credentials"
        });
    } else {
        const token = jwt.sign({
            id: ExistingUser._id
        }, JWT_PASSWORD);
        res.status(200).json({
            message: "Sign-in successful",
            token: token
        });
    }

})
app.post("/api/v1/content",(req,res) => {

})
app.get("/api/v1/content",(req,res) => {

})
app.delete("/api/v1/content",(req,res) => {

})
app.post("/api/v1/brain/share",(req,res) => {

})
app.get("/api/v1/brain/:shareLink",(req,res) => {

})

