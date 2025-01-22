const fs = require("fs");
const path = require("path");
require("dotenv").config(); // Load existing .env variables into process.env

// Define the path to your .env file
const envPath = path.resolve(__dirname, "../.env"); // Adjusted for correct relative path

/**
 * Updates or adds a key-value pair to the .env file.
 * @param {string} key - The key to add or update.
 * @param {string} value - The value to set for the key.
 */
function updateEnv(key, value) {
  // Read the current .env file
  let envContent = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, "utf-8")
    : "";

  // Parse the .env content into an object
  const envLines = envContent.split("\n").filter((line) => line.trim() !== "");
  const envObject = {};
  envLines.forEach((line) => {
    const [k, v] = line.split("=");
    envObject[k.trim()] = v ? v.trim() : "";
  });

  // Update or add the key-value pair
  envObject[key] = value;

  // Convert the updated object back into .env format
  const newEnvContent = Object.entries(envObject)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  // Write the updated content back to the .env file
  fs.writeFileSync(envPath, newEnvContent, "utf-8");

  console.log(`Updated .env file with ${key}=${value}`);
}

module.exports = { updateEnv };
