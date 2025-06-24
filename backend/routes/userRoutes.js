import express from 'express';
import {
  getAllUsers,
  getUsersByRole,
  getUserById,
  updateUser,
  deleteUser,
  getDashboardStats,
  assignProctor,
  getMyStudents
} from '../controllers/userController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin only routes
router.get('/', protect, getAllUsers);
router.get('/stats', protect, getDashboardStats);
router.get('/role/:role', protect, getUsersByRole);
router.get('/my-students', protect, getMyStudents);
router.get('/:userId', protect, getUserById);
router.put('/:userId', protect, isAdmin, updateUser);
router.delete('/:userId', protect, isAdmin, deleteUser);
router.post('/assign-proctor', protect, assignProctor);

export default router;
