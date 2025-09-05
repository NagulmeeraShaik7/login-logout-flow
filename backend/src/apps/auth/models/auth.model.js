import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Enable sqlite3 verbose for better diagnostics in dev
sqlite3.verbose();

let dbInstance = null;

export async function getDb() {
  if (dbInstance) return dbInstance;
  const dbFile = process.env.DATABASE_FILE || './auth.sqlite';
  dbInstance = await open({
    filename: dbFile,
    driver: sqlite3.Database,
  });
  return dbInstance;
}

export async function initDb() {
  const db = await getDb();

  // Users table with unique email and created_at/updated_at
  await db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT (datetime('now')),
      updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

  // Trigger to keep updated_at fresh
  await db.exec(`
    CREATE TRIGGER IF NOT EXISTS trg_users_updated_at
    AFTER UPDATE ON users
    FOR EACH ROW
    BEGIN
      UPDATE users SET updated_at = datetime('now') WHERE id = OLD.id;
    END;
  `);
}
