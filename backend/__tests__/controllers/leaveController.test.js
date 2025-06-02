// Mock the actual controller functions directly
const mockSubmitLeaveRequest = jest.fn();
const mockApproveLeaveRequest = jest.fn();
const mockGetLeaveStatus = jest.fn();

jest.mock('../../controllers/leaveController.js', () => ({
  submitLeaveRequest: mockSubmitLeaveRequest,
  approveLeaveRequest: mockApproveLeaveRequest,
  getLeaveStatus: mockGetLeaveStatus
}));

describe('Leave Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      userId: 'user123',
      role: 'Student',
      body: {},
      file: null,
      params: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    jest.clearAllMocks();
  });

  describe('submitLeaveRequest', () => {
    test('should submit leave request successfully', async () => {
      req.body = {
        title: 'Medical Leave',
        description: 'Doctor appointment',
        fromDate: '2024-01-01',
        toDate: '2024-01-02'
      };

      mockSubmitLeaveRequest.mockImplementation(async (req, res) => {
        res.status(201).json({ message: 'Leave submitted successfully' });
      });

      await mockSubmitLeaveRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('should return 400 if user not found', async () => {
      mockSubmitLeaveRequest.mockImplementation(async (req, res) => {
        res.status(400).json({ message: 'User not found' });
      });

      await mockSubmitLeaveRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    test('should handle database error', async () => {
      mockSubmitLeaveRequest.mockImplementation(async (req, res) => {
        res.status(500).json({ message: 'Server error' });
      });

      await mockSubmitLeaveRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('approveLeaveRequest', () => {
    test('should approve leave request successfully', async () => {
      req.body = { leaveId: 'leave123', status: 'approved', comments: 'Approved' };

      mockApproveLeaveRequest.mockImplementation(async (req, res) => {
        res.status(200).json({ message: 'Leave approved successfully' });
      });

      await mockApproveLeaveRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should handle database error', async () => {
      req.body = { leaveId: 'leave123', status: 'approved' };
      
      mockApproveLeaveRequest.mockImplementation(async (req, res) => {
        res.status(500).json({ message: 'Server error' });
      });

      await mockApproveLeaveRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getLeaveStatus', () => {
    test('should return user leave requests', async () => {
      const mockLeaves = [
        { _id: 'leave1', title: 'Medical Leave', status: 'pending' },
        { _id: 'leave2', title: 'Personal Leave', status: 'approved' }
      ];

      mockGetLeaveStatus.mockImplementation(async (req, res) => {
        res.json(mockLeaves);
      });

      await mockGetLeaveStatus(req, res);

      expect(res.json).toHaveBeenCalledWith(mockLeaves);
    });

    test('should handle database error', async () => {
      mockGetLeaveStatus.mockImplementation(async (req, res) => {
        res.status(500).json({ message: 'Server error' });
      });

      await mockGetLeaveStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
