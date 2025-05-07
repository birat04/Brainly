import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/brainly");

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
});

export const UserModel = mongoose.model("User", UserSchema);

const ContentSchema = new Schema({
    title: String,
    content: String,
    tags: [{ type: mongoose.Types.ObjectId, ref: "Tag" }],
    type: String,
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    }
});

export const ContentModel = mongoose.model("Content", ContentSchema);

const LinkSchema = new Schema({
    hash: String,
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    }
});

export const LinkModel = mongoose.model("Link", LinkSchema);
