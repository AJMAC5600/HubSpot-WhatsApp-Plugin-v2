// config/reloadEnv.js
const dotenv = require("dotenv");
const fs = require("fs");

// Function to reload environment variables
function reloadEnv() {
  delete require.cache[require.resolve("dotenv")]; // Clear the cached dotenv module
  dotenv.config(); // Reload the environment variables from the .env file

  // If the process needs to be re-initialized with new env variables
  console.log("Environment variables reloaded!");

  // If your app uses configurations like database connections or services
  // that rely on environment variables, you may need to re-initialize them
  // For example:
  // someDatabaseConnection.reconnect();
  // someAPIService.updateConfig();
}

// Watch for changes in the .env file
fs.watch(".env", (eventType, filename) => {
  if (eventType === "change") {
    reloadEnv(); // Reload the environment variables when .env changes
  }
});

module.exports = reloadEnv;
