import jwt from 'jsonwebtoken';

// ✅ Removed unused `User` import

// Middleware to protect routes using Bearer token in Authorization header
export const authMiddleware = (req, res, next) => {
  const token = req.headers?.authorization?.split(' ')[1]; // ✅ Uses optional chaining

  if (!token) {
    return res.status(401).json({ message: 'Authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.role = decoded.role;
    next();
  } catch {
    // ✅ No variable if not used, cleaner handling
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Duplicate protection middleware (can be refactored into one with authMiddleware)
export const protect = (req, res, next) => {
  const token = req.headers?.authorization?.split(' ')[1]; // ✅ Optional chaining

  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Role-based access middleware for HOD
export const isHOD = (req, res, next) => {
  if (req.role === 'HOD') {
    next();
  } else {
    res.status(403).json({ message: 'Only HODs can access this' });
  }
};
