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
 * CORS setup (open for all origins)
 */
app.use(
  cors({
    origin: [
      'http://localhost:3000',                      // local dev
     'https://login-logout-flow-t8k2.vercel.app'  // production frontend
    ],
    credentials: true,
  })
);



/**
 * Session store configuration
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
      secure: NODE_ENV === 'production', // true only in production
  sameSite:"none"
},

  })
);

app.set('trust proxy', 1);


/**
 * Health check endpoint
 */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'auth-backend' });
});

/**
 * Application routes
 */
app.use('/api/auth', authRouter);

/**
 * Swagger API docs
 */
setupSwagger(app);

/**
 * Global error handler
 */
app.use(errorHandler);

/**
 * Server startup
 */
const PORT = Number(process.env.PORT || 4000);

await initDb();
console.log('Database initialized');

app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
  console.log(`📚 Swagger docs available at http://localhost:${PORT}/api-docs`);
});
