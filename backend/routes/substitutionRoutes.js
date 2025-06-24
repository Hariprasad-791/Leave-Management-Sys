import express from 'express';
import {
  getAvailableSubstitutes,
  getFacultyTimetableForDates,
  respondToSubstitution,
  getSubstitutionRequests
} from '../controllers/substitutionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/available', protect, getAvailableSubstitutes);
router.get('/timetable-for-dates', protect, getFacultyTimetableForDates);
router.post('/respond', protect, respondToSubstitution);
router.get('/requests', protect, getSubstitutionRequests);

export default router;
