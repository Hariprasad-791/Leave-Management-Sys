import request from 'supertest';
import express from 'express';
import { login, signup } from '../../controllers/authController.js';
import User from '../../models/User.js';
import bcrypt from 'bcryptjs';

jest.mock('../../models/User.js');
jest.mock('bcryptjs');

const app = express();
app.use(express.json());
app.post('/login', login);
app.post('/signup', signup);

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /login', () => {
    test('should login admin successfully', async () => {
      const res = await request(app)
        .post('/login')
        .send({ email: 'admin', password: 'admin123' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    test('should login regular user successfully', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'Student'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const res = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    test('should return 400 for invalid credentials', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/login')
        .send({ email: 'wrong@example.com', password: 'wrongpassword' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid credentials');
    });

    test('should return 400 for wrong password', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'Student'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  describe('POST /signup', () => {
    test('should create user successfully', async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedpassword');
      User.prototype.save = jest.fn().mockResolvedValue();

      const res = await request(app)
        .post('/signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'Student',
          department: 'CSE'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('User created successfully');
    });

    test('should return 400 if user already exists', async () => {
      User.findOne.mockResolvedValue({ email: 'test@example.com' });

      const res = await request(app)
        .post('/signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'Student',
          department: 'CSE'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('User already exists');
    });

    test('should prevent multiple HODs in same department', async () => {
      User.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ role: 'HOD', department: 'CSE' });

      const res = await request(app)
        .post('/signup')
        .send({
          name: 'Test HOD',
          email: 'hod@example.com',
          password: 'password123',
          role: 'HOD',
          department: 'CSE'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('A HOD already exists for this department.');
    });
  });
});
