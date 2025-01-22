const express = require("express");
const router = express.Router();
const {
  getHubSpotAccessToken,
  refreshAccessToken,
} = require("../controllers/oauthController");
const db = require("../config/database"); // Import the database connection

// OAuth route for HubSpot authorization
router.get("/oauth", (req, res) => {
  db.get("SELECT * FROM settings WHERE id = 1", (err, settings) => {
    if (err) {
      console.error("Error fetching settings from database:", err);
      return res.status(500).send("Error loading settings from database");
    }

    if (settings) {
      // Construct the HubSpot OAuth URL with values from the database
      const hubSpotAuthUrl = `https://app.hubspot.com/oauth/authorize?client_id=${settings.hubspotClientId}&redirect_uri=${process.env.HUBSPOT_REDIRECT_URI}&scope=crm.objects.contacts.read crm.objects.contacts.write oauth`;

      console.log(hubSpotAuthUrl);
      res.redirect(hubSpotAuthUrl); // Redirect the user to HubSpot OAuth
    } else {
      console.error("No settings found in the database");
      res.status(404).send("Settings not found in the database");
    }
  });
});

// Callback route to get the access token
router.get("/oauth/callback", getHubSpotAccessToken);

// Optional: Route for manual token refresh
router.get("/refresh", (req, res) => {
  refreshAccessToken();
  res.send("Token refresh initiated.");
});

module.exports = router;