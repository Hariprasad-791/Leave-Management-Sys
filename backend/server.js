import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import cron from 'node-cron';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { revertSubstituteProctors } from './controllers/leaveController.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:5000',
        'https://leave-management-app.azurewebsites.net',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV 
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/upload', uploadRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'frontend_build')));
    
    // Serve React app for all non-API routes
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'frontend_build', 'index.html'));
    });
}

// Database connection
const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ MongoDB connected successfully');
    } catch (err) {
        console.error('❌ Error connecting to MongoDB:', err.message);
        process.exit(1);
    }
};

// Cron job for cleanup
cron.schedule('0 0 * * *', async () => {
    try {
        await revertSubstituteProctors();
        console.log('✅ Daily cleanup of substitute proctors complete.');
    } catch (err) {
        console.error('❌ Error in cron job:', err);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

// Start server - bind to 0.0.0.0 for Docker
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on 0.0.0.0:${PORT}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV}`);
    connectToDB();
});

// Debug environment variables
console.log('Cloudinary name:', process.env.CLOUDINARY_NAME);
console.log('Cloudinary key:', process.env.CLOUDINARY_KEY);
console.log('Cloudinary secret:', process.env.CLOUDINARY_SECRET ? '***SET***' : 'NOT SET');
