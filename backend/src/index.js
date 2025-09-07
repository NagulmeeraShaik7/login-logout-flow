import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import SQLiteStoreFactory from 'connect-sqlite3';
import cors from 'cors';
import authRouter from './apps/auth/routes/auth.route.js';
import errorHandler from './middlewares/error.middleware.js';
import { initDb } from './apps/auth/models/auth.model.js';
import { setupSwagger } from './infrastructures/config/swagger.config.js';

// Load local .env only if not in production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();

/** Middleware: JSON + URL-encoded parsers */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/** Trust proxy (required for secure cookies behind proxies) */
app.set('trust proxy', 1);

/** Allowed origins for CORS */
const allowedOrigins = [
  'http://localhost:3000',
  'https://login-logout-flow-t8k2.vercel.app',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

/** Session store configuration */
const SQLiteStore = SQLiteStoreFactory(session);

const SESSION_SECRET = process.env.SESSION_SECRET || 'changeme';
const SESSION_NAME = process.env.SESSION_NAME || 'sid';
const SESSION_COOKIE_MAX_AGE_MS = Number(process.env.SESSION_COOKIE_MAX_AGE_MS) || 1000 * 60 * 60 * 24 * 14; // 14 days
const SESSION_DB_FILE = process.env.SESSION_DB_FILE || './sessions.sqlite';
const NODE_ENV = process.env.NODE_ENV || 'development';

const sessionOptions = {
  name: SESSION_NAME,
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new SQLiteStore({ db: SESSION_DB_FILE.replace(/^\.\/+/, '') }),
  cookie: {
    maxAge: SESSION_COOKIE_MAX_AGE_MS,
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: NODE_ENV === 'production' ? 'None' : 'Lax',
  },
};

console.log('🚀 NODE_ENV:', NODE_ENV);
console.log('🍪 Session cookie config:', sessionOptions.cookie);

app.use(session(sessionOptions));

/** Health check */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'auth-backend' });
});

/** Routes */
app.use('/api/auth', authRouter);

/** Swagger */
setupSwagger(app);

/** Global error handler */
app.use(errorHandler);

/** Server startup */
const PORT = Number(process.env.PORT || 4000);

await initDb();
console.log('Database initialized');

app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
  console.log(`📚 Swagger docs available at http://localhost:${PORT}/api-docs`);
});
