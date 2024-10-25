const express = require("express");
const router = express.Router();
const axios = require("axios");
const { getLinkedInProfile } = require("../services/linkedinService");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

router.get("/linkedin", (req, res) => {
  const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=openid%20profile%20w_member_social%20email`;
  res.redirect(linkedInAuthUrl);
});

router.get("/auth/linkedin/callback", async (req, res) => {
  console.log("Callback received. Query parameters:", req.query);
  const authorizationCode = req.query.code;

  if (!authorizationCode) {
    console.error("No authorization code received");
    return res
      .status(400)
      .send(
        "No authorization code received. Please try the authentication process again."
      );
  }

  try {
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", authorizationCode);
    params.append("redirect_uri", REDIRECT_URI);
    params.append("client_id", CLIENT_ID);
    params.append("client_secret", CLIENT_SECRET);

    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
      }
    );

    res.send("Authorization successful!");
  } catch (error) {
    console.error(
      "Error fetching access token:",
      error.response ? error.response.data : error.message
    );
    res.status(500).send("Error fetching access token.");
  }
});

router.get("/get-linkedin-urn", async (req, res) => {
  try {
    const linkedinUrn = await getLinkedInProfile(
      process.env.LINKEDIN_ACCESS_TOKEN
    );
    if (linkedinUrn) {
      res.send(`Your LinkedIn URN is: ${linkedinUrn}`);
    } else {
      res.status(404).send("LinkedIn URN not found.");
    }
  } catch (error) {
    console.error("Error fetching LinkedIn URN:", error);
    res.status(500).send("Error fetching LinkedIn URN");
  }
});

module.exports = router;