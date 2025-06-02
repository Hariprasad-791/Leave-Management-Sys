describe('Upload Routes', () => {
  test('should export router', () => {
    const uploadRoutes = require('../../routes/uploadRoutes.js');
    expect(uploadRoutes).toBeDefined();
  });
});
