describe('Auth Routes', () => {
  test('should export router', () => {
    const authRoutes = require('../../routes/authRoutes.js');
    expect(authRoutes).toBeDefined();
  });
});
