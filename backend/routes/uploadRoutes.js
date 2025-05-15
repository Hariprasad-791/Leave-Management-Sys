// routes/uploadRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// File upload endpoint using Cloudinary
router.post('/', protect, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Return the Cloudinary URL
    res.json({ url: req.file.path });
});

export default router;
