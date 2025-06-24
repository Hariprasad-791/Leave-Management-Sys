import express from 'express';
import { uploadTimetable, getTimetable } from '../controllers/timetableController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadExcel } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', protect, uploadExcel.single('timetable'), uploadTimetable);
router.get('/my-timetable', protect, getTimetable);

export default router;
