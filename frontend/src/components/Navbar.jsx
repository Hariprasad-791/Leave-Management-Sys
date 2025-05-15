import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getRole, removeToken } from '../utils/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const role = getRole();

  const logout = () => {
    removeToken();
    navigate('/');
  };

  return (
    <nav>
      <span>Leave Management System</span>
      <div>
        <span>Role: {role}</span>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
