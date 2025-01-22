const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// SQLite connection setup
const db = new sqlite3.Database(path.join(__dirname, "hubspot_plugin.db"), (err) => {
  if (err) {
    console.error("Error connecting to SQLite:", err.message);
    return;
  }
  console.log("Connected to SQLite database.");

  // Create 'settings' table if it doesn't exist
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hubspotClientId TEXT NOT NULL,
      hubspotClientSecret TEXT NOT NULL,
      whatsappApiKey TEXT NOT NULL,
      access_token TEXT,
      refresh_token TEXT,
      expires_at DATETIME
    )
  `;

  db.run(createTableQuery, (err) => {
    if (err) {
      console.error("Error creating 'settings' table:", err.message);
    } else {
      console.log("'settings' table is ready.");
    }
  });
});

module.exports = db;
