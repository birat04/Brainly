import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { JWT_PASSWORD } from "./config";
import { random } from "./utils";
import bcrypt from "bcrypt";
import { userMiddleware } from "./middleware";

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/v1/signup", async (req, res) => {
  const { username, password }: { username: string; password: string } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword
      }
    });
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(409).json({ message: "User already exists" });
  }
});

app.post("/api/v1/signin", async (req, res) => {
  const { username, password } = req.body;
  const existingUser = await prisma.user.findUnique({ where: { username } });
  console.log("User:",existingUser);
  if (!existingUser) {
    res.status(403).json({ message: "Invalid credentials" });
    return;
  }
  const isMatch = await bcrypt.compare(password, existingUser.password);
  console.log("Password match:",isMatch)
  if (!isMatch) {
    res.status(403).json({ message: "Invalid credentials" });
    return;
  }
  const token = jwt.sign({ id: existingUser.id }, JWT_PASSWORD);
  res.status(200).json({ message: "Sign-in successful", token });
});

app.post("/api/v1/content", userMiddleware, async (req, res) => {
  const { link, type, title } = req.body;
  await prisma.content.create({
    data: {
      link,
      type,
      title,
      userId: Number(req.userId),
      tags: [],
      content: ""
    }
  });
  res.status(201).json({ message: "Content created successfully" });
});

app.get("/api/v1/content", userMiddleware, async (req, res) => {
  const content = await prisma.content.findMany({
    where: { userId: Number(req.userId) },
    include: { user: { select: { username: true } } }
  });
  res.json({ content });
});

app.delete("/api/v1/content", userMiddleware, async (req, res) => {
  const contentId = req.body.contentId;
  await prisma.content.deleteMany({
    where: {
      id: contentId,
      userId: Number(req.userId)
    }
  });
  res.json({ message: "Content deleted successfully" });
});

app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
  const { share } = req.body.share;
  if (share) {
    await prisma.link.create({
      data: {
        userId: Number(req.userId),
        hash: random(10)
      }
    });
    res.json({ message: "created shareable link" });
  } else {
    await prisma.link.deleteMany({
      where: { userId: Number(req.userId) }
    });
    res.json({ message: "removed shareable link" });
  }
});

app.get("/api/v1/brain/:shareLink", async (req, res) => {
  const hash = req.params.shareLink;
  const link = await prisma.link.findUnique({ where: { hash } });
  if (!link) {
    res.status(404).json({ message: "Shareable link not found" });
    return;
  }
  const content = await prisma.content.findFirst({ where: { userId: link.userId } });
  const user = await prisma.user.findUnique({ where: { id: link.userId } });
  if (!content || !user) {
    res.status(404).json({ message: "Content or user not found" });
    return;
  }
  res.json({ username: user.username, content });
});

app.get("/api/v1/debug/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json({ users });
});

app.get("/api/v1/debug/content", async (req, res) => {
  const content = await prisma.content.findMany({ include: { user: { select: { username: true } } } });
  res.json({ content });
});

app.get("/api/v1/debug/links", async (req, res) => {
  const links = await prisma.link.findMany({ include: { user: { select: { username: true } } } });
  res.json({ links });
});

app.listen(3000, () => {
  console.log("✅ Server started on http://localhost:3000");
});
