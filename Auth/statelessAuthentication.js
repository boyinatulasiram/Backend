import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "./models/user.js";
import mongoose from "mongoose";
import "dotenv/config";


// ====================
// DATABASE CONNECTION
// ====================

async function connectDB() {
    try {
        await mongoose.connect("mongodb://localhost:27017/moviesDB");
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

connectDB();


// ====================
// EXPRESS SETUP
// ====================

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ====================
// JWT SECRETS
// ====================

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;


// ====================
// REGISTER
// ====================

app.post("/register", async (req, res) => {

    try {

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

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Registration failed"
        });
    }
});


// ====================
// LOGIN
// ====================

app.post("/login", async (req, res) => {

    try {

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


        // Short-lived access token
        const accessToken = jwt.sign(
            {
                userId: user._id
            },
            ACCESS_SECRET,
            {
                expiresIn: "15m"
            }
        );


        // Long-lived refresh token
        const refreshToken = jwt.sign(
            {
                userId: user._id
            },
            REFRESH_SECRET,
            {
                expiresIn: "7d"
            }
        );


        res.status(200).json({
            message: "Login successful",
            accessToken,
            refreshToken
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Login failed"
        });
    }
});


// ====================
// ACCESS TOKEN MIDDLEWARE
// ====================

function authMiddleware(req, res, next) {

    const authHeader = req.headers.authorization;


    // Check whether Authorization header exists
    if (!authHeader) {
        return res.status(401).json({
            message: "Access token required"
        });
    }


    // Expected:
    // Authorization: Bearer <token>

    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Invalid authorization header"
        });
    }


    const token = authHeader.split(" ")[1];


    try {

        const decoded = jwt.verify(
            token,
            ACCESS_SECRET
        );


        // Store decoded information
        // so the next route can access it

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid or expired access token"
        });
    }
}


// ====================
// REFRESH ACCESS TOKEN
// ====================

app.post("/auth/refresh", (req, res) => {

    const { refreshToken } = req.body;


    if (!refreshToken) {
        return res.status(401).json({
            message: "Refresh token required"
        });
    }


    try {

        // Verify refresh token
        const decoded = jwt.verify(
            refreshToken,
            REFRESH_SECRET
        );


        // Create a NEW access token
        const newAccessToken = jwt.sign(
            {
                userId: decoded.userId
            },
            ACCESS_SECRET,
            {
                expiresIn: "15m"
            }
        );


        res.status(200).json({
            accessToken: newAccessToken
        });

    } catch (error) {

        return res.status(401).json({
            message: "Invalid or expired refresh token"
        });
    }
});


// ====================
// PROTECTED PROFILE
// ====================

app.get("/profile", authMiddleware, async (req, res) => {

    try {

        // authMiddleware created req.user
        const userId = req.user.userId;


        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }


        res.status(200).json({
            username: user.username
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch profile"
        });
    }
});


// ====================
// LOGOUT
// ====================

app.post("/logout", (req, res) => {

    /*
        With our current basic JWT implementation,
        the server does not maintain a session.

        Therefore logout is mainly handled by the client:

        - Delete access token
        - Delete refresh token

        Server-side refresh-token revocation requires
        additional state (Redis/database), which we'll
        cover later if needed.
    */

    res.status(200).json({
        message: "Logged out successfully. Client should delete tokens."
    });
});

// ====================
// SERVER
// ====================

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
