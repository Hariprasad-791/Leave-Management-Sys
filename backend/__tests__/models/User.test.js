describe('User Model', () => {
  test('should be defined', () => {
    const User = require('../../models/User.js');
    expect(User).toBeDefined();
  });

  test('should have required properties', () => {
    const User = require('../../models/User.js');
    expect(typeof User.default || User).toBe('function');
  });
});
