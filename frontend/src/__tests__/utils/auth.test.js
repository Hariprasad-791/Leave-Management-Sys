import { saveToken, getToken, removeToken, getRole } from '../../utils/auth';

describe('Auth Utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('saveToken stores token in localStorage', () => {
    const token = 'test-token';
    saveToken(token);
    expect(localStorage.getItem('token')).toBe(token);
  });

  test('getToken retrieves token from localStorage', () => {
    const token = 'test-token';
    localStorage.setItem('token', token);
    expect(getToken()).toBe(token);
  });

  test('removeToken removes token from localStorage', () => {
    localStorage.setItem('token', 'test-token');
    removeToken();
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('getRole returns role from token', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJyb2xlIjoiU3R1ZGVudCJ9.signature';
    localStorage.setItem('token', token);
    expect(getRole()).toBe('Student');
  });
});
