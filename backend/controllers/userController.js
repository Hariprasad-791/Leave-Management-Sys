import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

// Get users by role
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.find({ role }).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users by role:', error);
    res.status(500).json({ message: 'Server error while fetching users by role' });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, role, department, password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and if it already exists
    if (email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Check HOD constraint
    if (role === 'HOD' && role !== user.role) {
      const existingHod = await User.findOne({ 
        role: 'HOD', 
        department, 
        _id: { $ne: userId } 
      });
      if (existingHod) {
        return res.status(400).json({ message: 'A HOD already exists for this department' });
      }
    }

    // Update fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.department = department || user.department;

    // Update password if provided
    if (password && password.trim() !== '') {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    // Return user without password
    const updatedUser = await User.findById(userId).select('-password');
    res.status(200).json({ 
      message: 'User updated successfully', 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error while updating user' });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deletion of admin user
    if (user.role === 'Admin') {
      return res.status(403).json({ message: 'Cannot delete admin user' });
    }

    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
};

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const [students, faculty, hods, totalUsers] = await Promise.all([
      User.countDocuments({ role: 'Student' }),
      User.countDocuments({ role: 'Faculty' }),
      User.countDocuments({ role: 'HOD' }),
      User.countDocuments({})
    ]);

    res.status(200).json({
      students,
      faculty,
      hods,
      totalUsers
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error while fetching stats' });
  }
};

// Assign proctor to student
export const assignProctor = async (req, res) => {
  try {
    const { studentId, facultyId } = req.body;

    if (!studentId || !facultyId) {
      return res.status(400).json({ message: 'Student ID and Faculty ID are required' });
    }

    const student = await User.findById(studentId);
    const faculty = await User.findById(facultyId);

    if (!student || student.role !== 'Student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!faculty || faculty.role !== 'Faculty') {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    if (student.proctor) {
      return res.status(400).json({ message: 'Student already has a proctor assigned' });
    }

    student.proctor = facultyId;
    await student.save();

    res.status(200).json({ message: 'Proctor assigned successfully' });
  } catch (error) {
    console.error('Error assigning proctor:', error);
    res.status(500).json({ message: 'Server error while assigning proctor' });
  }
};

// Get students under proctor
export const getMyStudents = async (req, res) => {
  try {
    const facultyId = req.userId;
    const students = await User.find({ 
      proctor: facultyId 
    }).select('-password');

    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error while fetching students' });
  }
};
