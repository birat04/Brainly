import express from "express";
import mongoose from "mongoose";
import {UserModel,LinkModel,ContentModel} from "./db";
import jwt from "jsonwebtoken"
import cors from "cors";


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
        



    
app.post("/api/v1/signin",(req,res) => {


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

