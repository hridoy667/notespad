import express from 'express';
import cors from 'cors'; // 1. Imported cors package
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

//CORS
app.use(cors({
  origin: [
    'https://notespad-two.vercel.app', // production
    'http://localhost:5000',           // local
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Health Check Route
app.get('/api', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Backend API is live and running!',
    timestamp: new Date().toISOString()
  });
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));