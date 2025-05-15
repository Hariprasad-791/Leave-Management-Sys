import React, { useState } from 'react';
import API from '../utils/api';
import { saveToken, getRole } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loginUser = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      const { data } = await API.post('/auth/login', { email, password });
      
      if (data && data.token) {
        saveToken(data.token);
        const role = getRole();
        
        // Redirect based on user role
        if (role === 'Admin') navigate('/admin');
        else if (role === 'Student') navigate('/student');
        else if (role === 'Faculty') navigate('/faculty');
        else if (role === 'HOD') navigate('/hod');
        else {
          // Handle unexpected role
          setError('Invalid user role. Please contact administrator.');
          removeToken();
        }
      } else {
        setError('Login failed. Invalid response from server.');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.status === 400) {
        setError('Invalid email or password. Please try again.');
      } else if (err.response && err.response.status === 401) {
        setError('Unauthorized access. Please check your credentials.');
      } else {
        setError('Login failed. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={loginUser} className="login-form">
        <h2>Login</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input 
            type="text" 
            id="email"
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password"
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            disabled={loading}
          />
        </div>
        
        <button 
          type="submit" 
          className="login-btn" 
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default Login;
