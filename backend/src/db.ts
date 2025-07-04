import mongoose from "mongoose";


const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI!);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;

const { Schema } = mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: { 
    type: String,
    required: true
  }
}, { timestamps: true });

export const UserModel = mongoose.model("User", UserSchema);

const ContentSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, default: "" }, 
  link: { type: String, required: true }, 
  type: { type: String, required: true }, 
  tags: [{ type: String }],
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

export const ContentModel = mongoose.model("Content", ContentSchema);

const LinkSchema = new Schema({
  hash: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  }
}, { timestamps: true });

export const LinkModel = mongoose.model("Link", LinkSchema);
