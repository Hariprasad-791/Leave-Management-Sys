describe('User Routes', () => {
  test('should export router', () => {
    const userRoutes = require('../../routes/userRoutes.js');
    expect(userRoutes).toBeDefined();
  });
});
