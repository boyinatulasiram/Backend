// auth using oauth

import express from "express";
import "dotenv/config";
import axios from "axios";

const app = express();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;


// ============================
// STEP 1: SEND USER TO GOOGLE
// ============================

app.get("/auth/google", (req, res) => {

    const googleAuthURL =
        "https://accounts.google.com/o/oauth2/v2/auth?" +
        new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: GOOGLE_CALLBACK_URL,
            response_type: "code",
            scope: "openid email profile"
        });

    res.redirect(googleAuthURL);
});


// ==================================
// STEP 2: RECEIVE GOOGLE AUTH CODE
// ==================================

app.get("/auth/google/callback", async (req, res) => {

    const { code } = req.query;

    if (!code) {
        return res.status(400).json({
            message: "Authorization code missing"
        });
    }

    try {

        // ==================================
        // STEP 3: EXCHANGE CODE FOR TOKENS
        // ==================================

        const response = await axios.post(
            "https://oauth2.googleapis.com/token",

            new URLSearchParams({
                code: code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: GOOGLE_CALLBACK_URL,
                grant_type: "authorization_code"
            }),

            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );

        console.log(response.data);

        res.json(response.data);

    } catch (error) {

        console.error(
            error.response?.data || error.message
        );

        res.status(500).json({
            message: "Token exchange failed"
        });
    }
});


app.listen(8080, () => {
    console.log("Server running on port 8080");
});