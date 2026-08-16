import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';    
import { connectDB } from './config/db.js';
import userRoutes from './routes/user.routes.js';
import authRoutes from './routes/auth.routes.js';
import noteRoutes from './routes/note.routes.js';
import postRoutes from './routes/post.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Call DB connection
connectDB();

const app = express();

// Define allowed origins
const allowedOrigins = [
  'https://notespad-two.vercel.app',
  'http://localhost:5000',
  'http://localhost:5173', // Vite default port
  'http://localhost:3000', // React default port
  'http://127.0.0.1:5173'
];

// Configure CORS dynamic origin checking
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, mobile) OR matching origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS Blocked Origin]: ${origin}`);
      callback(new Error('Blocked by CORS policy'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204
};

// 1. MUST BE FIRST: Apply CORS middleware globally
app.use(cors(corsOptions));

// 2. Explicitly respond to preflight OPTIONS requests across all routes
app.options('*', cors(corsOptions));

app.use(express.json());

// Request logging middleware for debugging on Railway logs
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/posts', postRoutes);

// Fallback to index.html for root requests
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// 3. Global Error Handler (Prevents server crashes from stripping CORS headers)
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err.stack || err.message || err);
  res.status(500).json({ 
    message: err.message || 'Internal Server Error' 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));