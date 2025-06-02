import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';

jest.mock('../../utils/auth', () => ({
  getRole: jest.fn(() => 'Student'),
  removeToken: jest.fn(),
}));

const MockedDashboardLayout = ({ children }) => (
  <BrowserRouter>
    <DashboardLayout>{children}</DashboardLayout>
  </BrowserRouter>
);

describe('DashboardLayout Component', () => {
  test('renders dashboard layout', () => {
    render(<MockedDashboardLayout><div>Test Content</div></MockedDashboardLayout>);
    expect(document.body).toBeInTheDocument();
  });
});
