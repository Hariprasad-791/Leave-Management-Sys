import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to protect routes
export const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'Authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // Attach user ID to request
    req.role = decoded.role; // Attach user role to request
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
export const protect = (req, res, next) => {
  let token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Not authorized nor' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized try' });
  }
};
export const isHOD = (req, res, next) => {
  if (req.role === 'HOD') next();
  else res.status(403).json({ message: 'Only HODs can access this' });
};

