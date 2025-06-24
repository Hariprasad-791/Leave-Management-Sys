import express from 'express';
import { 
  submitLeaveRequest, 
  approveLeaveRequest, 
  getLeaveStatus, 
  getLeaveByFaculty,
  getLeavesByDepartment,
  getLeavesByStudent,
  applyLeave,
  updateLeaveSubstitutions,
  getLeavesForHOD,
  hodApproveReject,
  getLeavesByProctor,
  getLeaveById
} from '../controllers/leaveController.js';
import { assignProctor } from '../controllers/userController.js';
import { protect, isHOD } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Administrative routes
router.post('/assign-proctor', protect, isHOD, assignProctor);

// Leave application routes (New system with substitutions)
router.post('/apply', protect, upload.single('document'), applyLeave);
router.put('/:leaveId/substitutions', protect, updateLeaveSubstitutions);

// Legacy leave submission (Backward compatibility)
router.post('/submit', protect, upload.single('document'), submitLeaveRequest);

// Approval routes
router.post('/approve', protect, approveLeaveRequest);
router.put('/:leaveId/hod-action', protect, hodApproveReject);

// Status and retrieval routes
router.get('/status', protect, getLeaveStatus);
router.get('/student/:studentId', protect, getLeavesByStudent);
router.get('/department', protect, getLeavesByDepartment);
router.get('/proctor', protect, getLeaveByFaculty);
router.get('/faculty', protect, getLeavesByProctor);
router.get('/hod', protect, getLeavesForHOD); // Make sure this line exists
router.get('/:leaveId', protect, getLeaveById);

export default router;
