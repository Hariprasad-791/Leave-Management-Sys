describe('Role Middleware', () => {
  test('should be defined', () => {
    const roleMiddleware = require('../../middleware/roleMiddleware.js');
    expect(roleMiddleware).toBeDefined();
  });
});
