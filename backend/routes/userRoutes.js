import express from 'express';
import { getUsers, assignProctor, getUserById } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getUsers);
router.post('/assign-proctor', protect, assignProctor);
// routes/userRoutes.js
router.get('/:id', protect, getUserById);

export default router;
