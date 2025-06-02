import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock API before importing Login
jest.mock('../../utils/api', () => ({
  post: jest.fn(),
}));

jest.mock('../../utils/auth', () => ({
  saveToken: jest.fn(),
  removeToken: jest.fn(),
  getRole: jest.fn(() => 'Student'),
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

import Login from '../../components/Login';
import API from '../../utils/api';

const MockedLogin = () => (
  <BrowserRouter>
    <Login />
  </BrowserRouter>
);

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    render(<MockedLogin />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    // Use ID selector for password input to avoid multiple elements issue
    expect(document.getElementById('password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('handles input changes', () => {
    render(<MockedLogin />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = document.getElementById('password');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('shows error for empty fields', async () => {
    render(<MockedLogin />);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter both email and password/i)).toBeInTheDocument();
    });
  });

  test('handles successful login', async () => {
    API.post.mockResolvedValue({
      data: { token: 'fake-token' }
    });

    render(<MockedLogin />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = document.getElementById('password');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(API.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });
});
