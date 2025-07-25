import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import connectDB, { UserModel, LinkModel, ContentModel } from "./db";
import { JWT_PASSWORD } from "./config";
import { random } from "./utils";
import bcrypt from "bcrypt";
import { userMiddleware } from "./middleware";
import { body, validationResult } from "express-validator";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

connectDB();

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cors());


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);


app.post(
  "/api/v1/signup",
  [
    body("username").isString().isLength({ min: 3 }).trim(),
    body("password").isString().isLength({ min: 6 })
  ],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, password }: { username: string; password: string } = req.body;
    try {
      await UserModel.create({ username, password });
      res.status(201).json({ message: "User created successfully" });
    } catch (err) {
      res.status(409).json({ message: "User already exists" });
    }
  }
);


app.post(
  "/api/v1/signin",
  [
    body("username").isString().isLength({ min: 3 }).trim(),
    body("password").isString().isLength({ min: 6 })
  ],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { username, password } = req.body;
      const existingUser = await UserModel.findOne({ username });
      if (!existingUser) {
        return res.status(403).json({ message: "Invalid credentials" });
      }
      const isMatch = await bcrypt.compare(password, existingUser.password);
      if (!isMatch) {
        return res.status(403).json({ message: "Invalid credentials" });
      }
      const token = jwt.sign({ id: existingUser._id }, JWT_PASSWORD);
      res.status(200).json({ message: "Sign-in successful", token });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);


app.post(
  "/api/v1/content",
  userMiddleware,
  [
    body("title").isString().isLength({ min: 1 }),
    body("link").isString().isLength({ min: 5 }),
    body("type").isIn(["video", "article", "image"])
  ],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { link, type, title } = req.body;
      await ContentModel.create({
        link,
        type,
        title,
        userId: req.userId,
        tags: []
      });
      res.status(201).json({ message: "Content created successfully" });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);


app.get("/api/v1/content", userMiddleware, async (req, res) => {
  try {
    const content = await ContentModel.find({ userId: req.userId }).populate("userId", "username");
    res.json({ content });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});


app.delete("/api/v1/content", userMiddleware, async (req, res) => {
  try {
    const contentId = req.body.contentId;
    await ContentModel.deleteOne({
      _id: contentId,
      userId: req.userId
    });
    res.json({ message: "Content deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});


app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
  try {
    const { share } = req.body.share;
    if (share) {
      await LinkModel.create({
        userId: req.userId,
        hash: random(10)
      });
      res.json({ message: "created shareable link" });
    } else {
      await LinkModel.deleteOne({ userId: req.userId });
      res.json({ message: "removed shareable link" });
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});


app.get("/api/v1/brain/:shareLink", async (req: any, res: any) => {
  try {
    const hash = req.params.shareLink;
    const link = await LinkModel.findOne({ hash });
    if (!link) {
      return res.status(404).json({ message: "Shareable link not found" });
    }
    const content = await ContentModel.findOne({ userId: link.userId });
    const user = await UserModel.findById({ _id: link.userId });
    if (!content || !user) {
      return res.status(404).json({ message: "Content or user not found" });
    }
    res.json({ username: user?.username, content });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});


app.get("/api/v1/debug/users", async (req, res) => {
  try {
    const users = await UserModel.find();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/v1/debug/content", async (req, res) => {
  try {
    const content = await ContentModel.find().populate("userId", "username");
    res.json({ content });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/v1/debug/links", async (req, res) => {
  try {
    const links = await LinkModel.find().populate("userId", "username");
    res.json({ links });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});


app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});


app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(3000, () => {
  console.log("✅ Server started on http://localhost:3000");
});
