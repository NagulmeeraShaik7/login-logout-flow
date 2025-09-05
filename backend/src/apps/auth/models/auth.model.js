import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Enable sqlite3 verbose for better diagnostics in dev
sqlite3.verbose();

let dbInstance = null;

/**
 * Get or create a singleton SQLite database connection.
 *
 * @async
 * @function getDb
 * @returns {Promise<import('sqlite').Database>} A SQLite database instance.
 *
 * @description
 * Ensures a single database connection is reused throughout the application.
 * The database file location is determined by the `DATABASE_FILE` environment variable,
 * or defaults to `./auth.sqlite`.
 *
 * @example
 * const db = await getDb();
 * const users = await db.all('SELECT * FROM users');
 */
export async function getDb() {
  if (dbInstance) return dbInstance;
  const dbFile = process.env.DATABASE_FILE || './auth.sqlite';
  dbInstance = await open({
    filename: dbFile,
    driver: sqlite3.Database,
  });
  return dbInstance;
}

/**
 * Initialize the database schema and triggers.
 *
 * @async
 * @function initDb
 * @returns {Promise<void>} Resolves when the database is initialized.
 *
 * @description
 * - Creates a `users` table if it does not exist, with the following fields:
 *   - `id` (primary key, auto-increment)
 *   - `email` (unique, not null)
 *   - `password_hash` (not null)
 *   - `created_at` (timestamp, defaults to current time)
 *   - `updated_at` (timestamp, defaults to current time)
 * - Creates an index on `users.email` for fast lookups.
 * - Adds a trigger `trg_users_updated_at` to automatically update
 *   the `updated_at` field whenever a user row is modified.
 *
 * @example
 * await initDb();
 * console.log("Database initialized and schema ready.");
 */
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
