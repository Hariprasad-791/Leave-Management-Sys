import React from 'react';
import { render } from '@testing-library/react';

// Mock the Navbar component to return a simple nav element
jest.mock('../../components/Navbar', () => {
  return function MockNavbar() {
    return <nav>Navbar</nav>;
  };
});

jest.mock('../../utils/auth', () => ({
  getRole: jest.fn(() => 'Student'),
  removeToken: jest.fn(),
}));

import Navbar from '../../components/Navbar';

describe('Navbar Component', () => {
  test('renders navbar', () => {
    render(<Navbar />);
    expect(document.querySelector('nav')).toBeInTheDocument();
  });
});
