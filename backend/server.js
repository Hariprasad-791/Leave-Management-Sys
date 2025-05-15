import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';

import mongoose from 'mongoose';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const connecttoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
};


// server.js
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



app.use(express.static(path.join(__dirname, 'frontend_build')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'frontend_build', 'index.html'));
});

// Add upload routes
import uploadRoutes from './routes/uploadRoutes.js';
app.use('/api/upload', uploadRoutes);
import cron from 'node-cron';
import {revertSubstituteProctors} from './controllers/leaveController.js';

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    await revertSubstituteProctors();
    console.log('✅ Daily cleanup of substitute proctors complete.');
  } catch (err) {
    console.error('❌ Error in cron job:', err);
  }
});


// Middleware to protect routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leave', leaveRoutes);
app.use(cors({
  origin: 'http://localhost:3000', // Your React frontend URL
  credentials: true
}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connecttoDB();  // Connect to the database when the server starts
});

console.log('Cloudinary name:', process.env.CLOUDINARY_NAME);
console.log('Cloudinary name:', process.env.CLOUDINARY_KEY);
console.log('Cloudinary name:', process.env.CLOUDINARY_SECRET);
