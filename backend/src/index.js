import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import SQLiteStoreFactory from 'connect-sqlite3';
import cors from 'cors'; // ✅ import cors
import authRouter from './apps/auth/routes/auth.route.js';
import errorHandler from './middlewares/error.middleware.js';
import { initDb } from './apps/auth/models/auth.model.js';

dotenv.config();

const app = express();

/** Core middleware */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/** CORS setup */
const {
  CLIENT_URL = 'http://localhost:3000', // ✅ frontend URL
} = process.env;

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true, // ✅ allow cookies to be sent
  })
);

/** Session store (SQLite) */
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
      db: SESSION_DB_FILE.replace(/^\.\/+/, ''), // connect-sqlite3 stores in ./ by default
    }),
    cookie: {
      maxAge: Number(SESSION_COOKIE_MAX_AGE_MS),
      httpOnly: true,
      secure: NODE_ENV === 'production', // set true in HTTPS
      sameSite: 'lax',
    },
  })
);

/** Health */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'auth-backend' });
});

/** Routes */
app.use('/api/auth', authRouter);

/** Error handler (last) */
app.use(errorHandler);

/** Start */
const PORT = Number(process.env.PORT || 4000);

await initDb(); // ensure DB schema ready before serving
console.log('Database initialized');

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
