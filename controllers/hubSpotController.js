require("dotenv").config();
const db = require("../config/database");

// Controller to fetch contacts from HubSpot API
const fetchHubSpotContacts = async () => {
  // Query to fetch the access token from the database
  const query = `SELECT access_token FROM settings WHERE id = 1`; // Assuming access_token is stored in the 'settings' table

  try {
    const settings = await new Promise((resolve, reject) => {
      db.get(query, (err, result) => {
        if (err) return reject(err);
        if (!result) return reject(new Error("Access token not found in the database"));
        resolve(result);
      });
    });

    // Ensure an access token was found in the database
    const { access_token } = settings;

    // HubSpot API URL to fetch contacts
    const apiUrl =
      "https://api.hubapi.com/crm/v3/objects/contacts?properties=firstname,lastname,email,phone"; // HubSpot API URL

    // Set up the headers with the access token
    const headers = {
      Authorization: `Bearer ${access_token}`,
    };

    const requestOptions = {
      method: "GET",
      headers: headers,
      redirect: "follow",
    };

    // Make the fetch request to the HubSpot API
    const response = await fetch(apiUrl, requestOptions);

    // Ensure response is okay (status 200 range)
    if (!response.ok) {
      throw new Error(`Error fetching contacts: ${response.statusText}`);
    }

    const result = await response.json(); // Parse the response as JSON

    return result.results || []; // Return the contacts or an empty array if no contacts are found
  } catch (error) {
    console.error("Error fetching contacts from HubSpot:", error);
    return []; // Return an empty array in case of error
  }
};

module.exports = { fetchHubSpotContacts };
