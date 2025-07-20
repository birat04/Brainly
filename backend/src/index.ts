import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

import connectDB, { UserModel, LinkModel, ContentModel } from "./db";
import { JWT_PASSWORD } from "./config";
import { random } from "./utils";



const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/v1/signup", async (req, res) => {
  const { username, password }: { username: string; password: string } = req.body;

  try {
    await UserModel.create({
      username,
      password
    });
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(411).json({ message: "User already exists" });
  }
});

app.post("/api/v1/signin", async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await UserModel.findOne({ username, password });
  if (!existingUser) {
    res.status(403).json({ message: "Invalid credentials" });
  } else {
    const token = jwt.sign({ id: existingUser._id }, JWT_PASSWORD);
    res.status(200).json({ message: "Sign-in successful", token });
  }
});

const userMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_PASSWORD) as { id: string };
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: "Forbidden" });
  }
};

app.post("/api/v1/content", userMiddleware, async (req, res) => {
  const { link, type, title } = req.body;

  await ContentModel.create({
    link,
    type,
    title,
    userId: req.userId,
    tags: []
  });

  res.status(201).json({ message: "Content created successfully" });
});

app.get("/api/v1/content", userMiddleware, async (req, res) => {
  const content = await ContentModel.find({ userId: req.userId }).populate("userId", "username");
  res.json({ content });
});

app.delete("/api/v1/content", userMiddleware, async (req, res) => {
  const contentId = req.body.contentId;

  await ContentModel.deleteOne({
    _id: contentId,
    userId: req.userId
  });

  res.json({ message: "Content deleted successfully" });
});

app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
  const { share } = req.body.share;
  if (share) {
    LinkModel.create({
      userId:req.userId,
      hash:random(10),
    })
    res.json({ message: "created shareable link" });
  } else {
    LinkModel.deleteOne({
      userId:req.userId
    })
    res.json({ message: "removed shareable link" });
  }
});
    

app.get("/api/v1/brain/:shareLink", async (req, res) => {
  const hash = req.params.shareLink;
  const link = await LinkModel.findOne({
    hash
  });
  if(!link){
    res.status(404).json({ 
      message: "Shareable link not found" 
    })
    return;
  }
  const content = await ContentModel.findOne({
    userId: link.userId
  })
  const user = await UserModel.findById({
    _id: link.userId

  })
  if(!content || !user){
    res.status(404).json({ 
      message: "Content or user not found" 
    })
    return;
  }

  res.json({
    username: user?.username,
    content
  })

})








  


 

app.get("/api/v1/debug/users", async (req, res) => {
  const users = await UserModel.find();
  res.json({ users });
});

app.get("/api/v1/debug/content", async (req, res) => {
  const content = await ContentModel.find().populate("userId", "username");
  res.json({ content });
});

app.get("/api/v1/debug/links", async (req, res) => {
  const links = await LinkModel.find().populate("userId", "username");
  res.json({ links });
});

app.listen(3000, () => {
  console.log("✅ Server started on http://localhost:3000");
});
