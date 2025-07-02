import dotenv from "dotenv";
dotenv.config();

export const JWT_PASSWORD = process.env.JWT_PASSWORD ?? "dev_secret";
export const MONGO_URI   = process.env.MONGO_URI   ?? "mongodb://localhost:27017/brainly";
export const PORT        = parseInt(process.env.PORT ?? "3000", 10);
