// auth using oauth

import express from "express";
import "dotenv/config";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";

const app = express();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

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

  try {
    // 1. Exchange authorization code for tokens
    const response = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code,
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

    // 2. Get ID token
    const idToken = response.data.id_token;

    // 3. Verify ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID
    });

    // 4. Get trusted user information
    const payload = ticket.getPayload();

    console.log(payload);

    res.json(payload);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Authentication failed"
    });
  }
});


app.listen(8080, () => {
    console.log("Server running on port 8080");
});