import mongoose from "mongoose";
import bcrypt from "bcrypt";

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/brainly");
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

export default connectDB;

const { Schema } = mongoose;

const UserSchema = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true }
}, { timestamps: true });

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

export const UserModel = mongoose.model("User", UserSchema);

const ContentSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, default: "" },
  link: { type: String, required: true },
  type: { type: String, required: true },
  tags: [{ type: String }],
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export const ContentModel = mongoose.model("Content", ContentSchema);

const LinkSchema = new Schema({
  hash: { type: String, unique: true, required: true },
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: true, unique: true }
}, { timestamps: true });

export const LinkModel = mongoose.model("Link", LinkSchema);
