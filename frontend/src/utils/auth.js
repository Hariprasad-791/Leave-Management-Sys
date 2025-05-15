export const saveToken = (token) => localStorage.setItem('token', token);
export const getToken = () => localStorage.getItem('token');
export const removeToken = () => localStorage.removeItem('token');
export const getRole = () => {
  const payload = JSON.parse(atob(getToken().split('.')[1]));
  return payload.role;
};
