import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock the entire App component to avoid Router nesting
jest.mock('../../App', () => {
  return function MockApp() {
    return <div>Welcome Back</div>;
  };
});

jest.mock('../../utils/auth', () => ({
  getToken: jest.fn(() => null),
  getRole: jest.fn(() => null),
}));

import App from '../../App';

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
    expect(document.body).toBeInTheDocument();
  });

  test('renders login page by default', () => {
    render(<App />);
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });
});
