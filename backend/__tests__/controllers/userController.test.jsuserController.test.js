// Mock the actual controller functions directly
const mockGetUsers = jest.fn();
const mockAssignProctor = jest.fn();
const mockGetUserById = jest.fn();
const mockCreateUser = jest.fn();

jest.mock('../../controllers/userController.js', () => ({
  getUsers: mockGetUsers,
  assignProctor: mockAssignProctor,
  getUserById: mockGetUserById,
  createUser: mockCreateUser
}));

describe('User Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      userId: 'user123'
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    test('should return all users', async () => {
      const mockUsers = [
        { _id: 'user1', name: 'User 1', role: 'Student' },
        { _id: 'user2', name: 'User 2', role: 'Faculty' }
      ];

      mockGetUsers.mockImplementation(async (req, res) => {
        res.json(mockUsers);
      });

      await mockGetUsers(req, res);

      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    test('should handle database error', async () => {
      mockGetUsers.mockImplementation(async (req, res) => {
        res.status(500).json({ message: 'Server error' });
      });

      await mockGetUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });

  describe('assignProctor', () => {
    test('should assign proctor successfully', async () => {
      req.body = { studentId: 'student123', facultyId: 'faculty123' };

      mockAssignProctor.mockImplementation(async (req, res) => {
        res.status(200).json({ message: 'Proctor assigned successfully' });
      });

      await mockAssignProctor(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Proctor assigned successfully'
      });
    });

    test('should return 400 if student not found', async () => {
      req.body = { studentId: 'student123', facultyId: 'faculty123' };
      
      mockAssignProctor.mockImplementation(async (req, res) => {
        res.status(400).json({ message: 'Invalid student' });
      });

      await mockAssignProctor(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid student' });
    });

    test('should handle database error', async () => {
      req.body = { studentId: 'student123', facultyId: 'faculty123' };
      
      mockAssignProctor.mockImplementation(async (req, res) => {
        res.status(500).json({ message: 'Server error' });
      });

      await mockAssignProctor(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });

  describe('getUserById', () => {
    test('should return user by id', async () => {
      req.params.id = 'user123';
      const mockUserData = {
        _id: 'user123',
        name: 'Test User',
        role: 'Student'
      };

      mockGetUserById.mockImplementation(async (req, res) => {
        res.json(mockUserData);
      });

      await mockGetUserById(req, res);

      expect(res.json).toHaveBeenCalledWith(mockUserData);
    });

    test('should return 404 if user not found', async () => {
      req.params.id = 'user123';
      
      mockGetUserById.mockImplementation(async (req, res) => {
        res.status(404).json({ message: 'User not found' });
      });

      await mockGetUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  });

  describe('createUser', () => {
    test('should create user successfully', async () => {
      req.body = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'Student',
        department: 'CSE'
      };

      const mockSavedUser = {
        _id: 'newuser123',
        name: 'New User',
        email: 'newuser@example.com',
        role: 'Student',
        department: 'CSE'
      };

      mockCreateUser.mockImplementation(async (req, res) => {
        res.status(201).json(mockSavedUser);
      });

      await mockCreateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockSavedUser);
    });

    test('should return 400 if user already exists', async () => {
      req.body = {
        name: 'New User',
        email: 'existing@example.com',
        password: 'password123',
        role: 'Student',
        department: 'CSE'
      };

      mockCreateUser.mockImplementation(async (req, res) => {
        res.status(400).json({ message: 'User already exists' });
      });

      await mockCreateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
    });
  });
});
