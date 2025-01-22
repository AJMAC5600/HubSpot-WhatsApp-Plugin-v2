// config/config.js

module.exports = {
  hubspot: {
    apiUrl: "https://api.hubapi.com",
    clientId: process.env.HUBSPOT_CLIENT_ID,
    clientSecret: process.env.HUBSPOT_CLIENT_SECRET,
    redirectUri: process.env.HUBSPOT_REDIRECT_URI,
  },
  whatsapp: {
    apiUrl: "https://graph.facebook.com/v13.0", // Update with your WhatsApp API URL
    apiKey: process.env.WHATSAPP_API_KEY, // Your WhatsApp API Key
  },
};
