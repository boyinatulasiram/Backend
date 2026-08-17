import express from "express";
import bcrypt from "bcrypt";
import User from "./models/user.js"
import { createClient } from "redis";
import { RedisStore } from "connect-redis";
import session from "express-session";
import mongoose from "mongoose";

async function connectDB(){
    try {
            await mongoose.connect("mongodb://localhost:27017/moviesDB");
            console.log("Connected to MongoDB");
        } catch (error) {
            console.error("Error connecting to MongoDB:", error);
        }
}

connectDB();
// import { use } from "react";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



const redisClient = createClient({
    url: "redis://localhost:6379"
});

await redisClient.connect();

app.use(session({
    store: new RedisStore({
        client: redisClient
    }),
    secret: "4CO2iyKAG9LpkUlFHcgH3hO+N3vWse0vsr5mELOuN34=",
    resave: false,
    saveUninitialized: false
}));

app.post("/auth/register", async(req,res)=>{
    let {username,password} = req.body;
    const isUser = await User.findOne({username});
    if(isUser){
        res.status(409).json({message:"Username already exists"});
    }

    else{
        let salt = await bcrypt.genSalt(19);
        const hashedPassword = await bcrypt.hash(password,salt);
        const newUser = await User.create({username,password:hashedPassword});
        res.status(201).json({message:"User registered succesfully", userId: newUser._id});
    }
});

app.post("/auth/login", async(req,res) =>{
    let {username,password} = req.body;
    const dbUser = await User.findOne({username});
    if (!dbUser) {
        return res.status(401).json({
            message: "Invalid credentials"
        });
    }

    const passwordMatch = await bcrypt.compare(password,dbUser.password);
    if (!passwordMatch) {
        return res.status(401).json({
            message: "Invalid credentials"
        });
    }

    req.session.userId = dbUser._id;

    res.status(200).json({
        message: "Login successful"
    });
});



app.get("/profile",async (req,res) =>{
    if(!req.session.userId){
        res.status(401).json({message:"User not Authenticated"});
        return;
    }

    const user = await User.findById(req.session.userId);
    res.status(200).json({username:user.username});
});

app.post("/auth/logout", (req, res) => {
    req.session.destroy(error => {

        if (error) {
            return res.status(500).json({
                message: "Logout failed"
            });
        }

        res.status(200).json({
            message: "Logged out"
        });
    });
});

app.listen(3000,(req,res)=>{
    console.log("Server running at port 3000");
})