// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.MONGO_URI = 'mongodb://localhost:27017/test-db';
process.env.CLOUDINARY_NAME = 'test-cloudinary';
process.env.CLOUDINARY_KEY = 'test-key';
process.env.CLOUDINARY_SECRET = 'test-secret';

// Mock console methods to reduce test output noise
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
});
