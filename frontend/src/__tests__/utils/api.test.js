
describe('API Utils', () => {
  test('API module exports default', () => {
    const API = require('../../utils/api');
    expect(API.default).toBeDefined();
  });

  test('API has required configuration', () => {
    const API = require('../../utils/api');
    expect(typeof API.default).toBe('object');
  });
});
