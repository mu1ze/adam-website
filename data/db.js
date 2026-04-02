import Database from 'better-sqlite3';
import path from 'path';

// Store the database file in the robust data directory
const dbPath = path.resolve(process.cwd(), 'data', 'adam-scores.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL'); // Performance optimization

// Initialize the SQLite schema if it does not exist
db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game TEXT NOT NULL,
    name TEXT NOT NULL,
    score INTEGER NOT NULL,
    date TEXT NOT NULL
  )
`);

export default db;
