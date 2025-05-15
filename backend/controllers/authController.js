import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = (req, res, next) => {
  let token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  // ✅ Check hardcoded admin login FIRST
  if (email === 'admin' && password === 'admin123') {
    const token = jwt.sign({ userId: 'admin', role: 'Admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  }

  // 🧠 Then check for users from MongoDB
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// User signup (Admin only)
export const signup = async (req, res) => {
  const { name, email, password, role, department } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }
if (role === 'HOD') {
  const existingHod = await User.findOne({ role: 'HOD', department });
  if (existingHod) {
    return res.status(400).json({ message: 'A HOD already exists for this department.' });
  }
}

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword, role, department });

  await user.save();
  return res.status(201).json({ message: 'User created successfully' });
};
