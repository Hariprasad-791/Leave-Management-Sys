import User from '../models/User.js';

// Create user (Admin only)
export const createUser = async (req, res) => {
  const { name, email, password, role, department } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      department,
    });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: 'Error creating user' });
  }
};

// Get all users (Admin only)
export const getUsers = async (req, res) => {
  const users = await User.find();
  return res.json(users);
};


// controllers/userController.js
export const assignProctor = async (req, res) => {
  const { studentId, facultyId } = req.body;
  const student = await User.findById(studentId);

  if (!student || student.role !== 'Student') {
    return res.status(400).json({ message: 'Invalid student' });
  }

  if (student.proctor) {
    return res.status(400).json({ message: 'Proctor already assigned' });
  }

  const faculty = await User.findById(facultyId);
  if (!faculty || faculty.role !== 'Faculty') {
    return res.status(400).json({ message: 'Invalid faculty' });
  }

  student.proctor = faculty._id;
  await student.save();
  res.status(200).json({ message: 'Proctor assigned successfully' });
};


// controllers/userController.js
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If the user is a student with a proctor, populate the proctor details
    if (user.role === 'Student' && user.proctor) {
      await user.populate('proctor');
    }
    
    // Don't send the password
    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      proctor: user.proctor
    };
    
    res.json(userWithoutPassword);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
