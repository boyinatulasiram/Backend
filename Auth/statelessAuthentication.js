import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "./models/user.js";
import mongoose from "mongoose";

async function connectDB() {
    try {
        await mongoose.connect("mongodb://localhost:27017/moviesDB");
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const JWT_SECRET = "4CO2iyKAG9LpkUlFHcgH3hO+N3vWse0vsr5mELOuN34=";


// REGISTER
app.post("/register", async (req, res) => {

    const { username, password } = req.body;

    const isUser = await User.findOne({ username });

    if (isUser) {
        return res.status(409).json({
            message: "User already exists"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 19);

    const newUser = await User.create({
        username,
        password: hashedPassword
    });

    res.status(201).json({
        message: "User registered successfully",
        userId: newUser._id
    });
});


// LOGIN
app.post("/login", async (req, res) => {

    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
        return res.status(401).json({
            message: "Invalid credentials"
        });
    }

    const passwordMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordMatch) {
        return res.status(401).json({
            message: "Invalid credentials"
        });
    }

    const token = jwt.sign(
        {
            userId: user._id
        },
        JWT_SECRET,
        {
            expiresIn: "15m"
        }
    );

    res.status(200).json({
        message: "Login successful",
        token
    });
});


// JWT MIDDLEWARE
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    // console.log(authHeader);
    if (!authHeader) {
        return res.status(401).json({
            message: "Access token required"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}


        *// PROTECTED ROUTE
app.get("/profile", authMiddleware, async (req, res) => {
    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    res.json({
        username: user.username
    });
});


app.post("/logout", async(req,res)=>{
    console.log("logout request");
})


app.listen(3000, () => {
    console.log("Server running on port 3000");
});