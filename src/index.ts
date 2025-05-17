import express from "express";
import mongoose from "mongoose";
import {UserModel,LinkModel,ContentModel} from "./db";
import jwt from "jsonwebtoken"
import cors from "cors";
import { JWT_PASSWORD } from "./config";
import { userMiddleware } from "./middleware";
import { Request,Response,NextFunction } from "express";

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

const authMiddleware = (req:Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split("")[1];
    if(!token){
        res.status(401).json({
            message: "Unauthorized"
        });
        return;
    }
    try{
        const decoded = jwt.verify(token,JWT_PASSWORD) as {id: string};
        req.userId = decoded.id;
        next();
    } catch(err){
        res.status(401).json({
            message:"Forbidden"
        })
    }
}
app.post("/api/v1/content",authMiddleware,async(req,res) => {
    const link = req.body.link;
    const type = req.body.type;
    await ContentModel.create({
        link,
        type,
        title: req.body.title,
        userId: req.userId,
        tags:[]
    })
    res.status(201).json({
        message: "Content created successfully"
    })

})
app.get("/api/v1/content",authMiddleware,async(req,res) => {
    const userId = req.userId;
    const content = await ContentModel.find({
        userId: userId
    }).populate("userId",'username')
    res.json({
        content:content
    })

})
app.delete("/api/v1/content",authMiddleware,async(req,res) => {
    const contentId = req.body.contentId;
    await ContentModel.deleteMany({
        contentId: contentId,
        userId: req.userId
    })
    res.json({
        message: "Content deleted successfully"
    })



})
app.post("/api/v1/brain/share",authMiddleware,async(req,res) => {
    const share = req.body.share;
    if(share){
        const existingLink = await LinkModel.findOne({
            userId: req.userId
        });
        if(existingLink){
            res.json({
                hash: existingLink.hash
            })
            return;
        }
        const hash = Math.random().toString(36).substring(2, 12);
        await LinkModel.create({
            hash: hash,
        })
        res.json({
            hash: hash
        })
    } else{
        await LinkModel.deleteOne({
            userId: req.userId
        });
        res.json({
            message: "Removed share link"
        })
    }


})
app.get("/api/v1/brain/:shareLink",async(req,res) => {
    const hash = req.params.shareLink;
    const Link = await LinkModel.findOne({
        hash: hash
    });
    if(!Link){
        res.status(404).json({
            message: "No such link"
        })
        return;
    }
    const content = await ContentModel.find({
        userId: Link.userId
    })
    console.log(Link);
    const user = await UserModel.findOne({
        _id: Link.userId
    })
    if(!user){
        res.status(404).json({
            message: "User not found, please try again"
        })
    }
    res.json({
        username: user?.username,
        content: content
    })

})
app.listen(5000, () => {
    console.log("Server started on port 5000");
})
        
    


