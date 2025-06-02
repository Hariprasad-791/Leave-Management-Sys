import jwt from 'jsonwebtoken';
import { protect, isHOD } from '../../middleware/authMiddleware.js';

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('protect middleware', () => {
    test('should call next for valid token', () => {
      req.headers.authorization = 'Bearer valid-token';
      jwt.verify.mockReturnValue({ userId: 'user123', role: 'Student' });

      protect(req, res, next);

      expect(req.userId).toBe('user123');
      expect(req.role).toBe('Student');
      expect(next).toHaveBeenCalled();
    });

    test('should return 401 for missing token', () => {
      protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 for invalid token', () => {
      req.headers.authorization = 'Bearer invalid-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('isHOD middleware', () => {
    test('should call next for HOD role', () => {
      req.role = 'HOD';

      isHOD(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should return 403 for non-HOD role', () => {
      req.role = 'Student';

      isHOD(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Only HODs can access this' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
