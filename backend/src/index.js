import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import SQLiteStoreFactory from 'connect-sqlite3';
import cors from 'cors';
import authRouter from './apps/auth/routes/auth.route.js';
import errorHandler from './middlewares/error.middleware.js';
import { initDb } from './apps/auth/models/auth.model.js';
import { setupSwagger } from './infrastructures/config/swagger.config.js';

dotenv.config();

const app = express();

/**
 * Core middleware: JSON + URL-encoded parsers
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * CORS setup
 *
 * Allows cross-origin requests from the configured frontend.
 * Ensures session cookies (`credentials`) can be exchanged.
 */
const {
  CLIENT_URL = 'http://localhost:3000',
} = process.env;

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

/**
 * Session store configuration
 *
 * Uses SQLite to persist sessions across server restarts.
 * Environment variables allow customization of:
 * - SESSION_SECRET (encryption secret)
 * - SESSION_NAME (cookie name)
 * - SESSION_COOKIE_MAX_AGE_MS (cookie lifetime)
 * - SESSION_DB_FILE (SQLite session DB filename)
 */
const SQLiteStore = SQLiteStoreFactory(session);
const {
  SESSION_SECRET = 'changeme',
  SESSION_NAME = 'sid',
  SESSION_COOKIE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 14,
  NODE_ENV = 'development',
  SESSION_DB_FILE = './sessions.sqlite',
} = process.env;

app.use(
  session({
    name: SESSION_NAME,
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({
      db: SESSION_DB_FILE.replace(/^\.\/+/, ''),
    }),
    cookie: {
      maxAge: Number(SESSION_COOKIE_MAX_AGE_MS),
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'lax',
    },
  })
);

/**
 * Health check endpoint
 *
 * @route GET /health
 * @returns {object} JSON response with service status
 */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'auth-backend' });
});

/**
 * Application routes
 *
 * @route /api/auth
 * Includes:
 * - POST /register
 * - POST /login
 * - GET /me
 * - POST /logout
 */
app.use('/api/auth', authRouter);

/**
 * Swagger API docs
 *
 * @route /docs
 * Interactive Swagger UI powered by swagger-jsdoc
 */
setupSwagger(app);

/**
 * Global error handler (last middleware)
 *
 * Catches and formats errors into JSON responses.
 */
app.use(errorHandler);

/**
 * Server startup
 *
 * Initializes SQLite schema, then starts Express server
 * on the configured port (default: 4000).
 */
const PORT = Number(process.env.PORT || 4000);

await initDb(); // Ensure DB schema is created before listening
console.log('Database initialized');

app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
  console.log(`📚 Swagger docs available at http://localhost:${PORT}/api-docs`);
});
