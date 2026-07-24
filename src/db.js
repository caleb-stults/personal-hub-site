const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const projectRoot = path.resolve(__dirname, '..');
const dbDir = process.env.DB_PATH ? path.dirname(process.env.DB_PATH) : path.join(projectRoot, 'data');
const dbPath = process.env.DB_PATH || path.join(dbDir, 'hub.sqlite');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
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