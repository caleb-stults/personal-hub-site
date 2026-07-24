const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Explicitly anchor the database path to the project root directory
// __dirname is 'src/', so path.resolve(__dirname, '../data') points directly to 'personal-hub-site/data'
const projectRoot = path.resolve(__dirname, '..');
const dbDir = process.env.DB_PATH ? path.dirname(process.env.DB_PATH) : path.join(projectRoot, 'data');
const dbPath = process.env.DB_PATH || path.join(dbDir, 'hub.sqlite');

// Ensure the data directory exists explicitly
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log(`[Database Connected] Tracking explicitly at: ${dbPath}`);
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      status TEXT DEFAULT 'todo',
      content TEXT
    )`);
  }
});

module.exports = db;