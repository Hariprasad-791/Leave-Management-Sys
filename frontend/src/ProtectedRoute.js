import React from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { getToken } from './utils/auth';

const ProtectedRoute = ({ children }) => {
  return getToken() ? children : <Navigate to="/" />;
};

// ✅ Add prop-types validation
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
