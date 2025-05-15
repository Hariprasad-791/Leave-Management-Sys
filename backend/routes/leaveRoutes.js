import express from 'express';
import { submitLeaveRequest, approveLeaveRequest, getLeaveStatus, getLeaveByFaculty,getLeavesByDepartment,getLeavesByStudent } from '../controllers/leaveController.js';
import { assignProctor } from '../controllers/userController.js';
import { protect, isHOD } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();
router.post('/assign-proctor', protect, isHOD, assignProctor);
router.post('/submit', protect, upload.single('document'), submitLeaveRequest);
router.post('/approve', protect, approveLeaveRequest);
router.get('/status', protect, getLeaveStatus);
// routes/leaveRoutes.js
router.get('/status', protect,getLeavesByStudent );
router.get('/department', protect, getLeavesByDepartment);
router.get('/proctor', protect, getLeaveByFaculty);

export default router;
