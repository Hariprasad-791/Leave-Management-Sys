export default {
  create: jest.fn(() => ({
    interceptors: {
      request: {
        use: jest.fn(),
        handlers: []
      },
      response: {
        use: jest.fn(),
        handlers: []
      }
    },
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
  })),
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  interceptors: {
    request: {
      use: jest.fn(),
      handlers: []
    },
    response: {
      use: jest.fn(),
      handlers: []
    }
  }
};
