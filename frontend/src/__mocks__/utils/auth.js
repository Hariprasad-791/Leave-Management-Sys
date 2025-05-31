export const getToken = jest.fn(() => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic3R1ZGVudCIsInVzZXJJZCI6IjEyMyIsIm5hbWUiOiJUZXN0IFVzZXIifQ.mock-signature');
export const setToken = jest.fn();
export const removeToken = jest.fn();
export const getRole = jest.fn(() => 'student');
export const getUserName = jest.fn(() => 'Test User');
