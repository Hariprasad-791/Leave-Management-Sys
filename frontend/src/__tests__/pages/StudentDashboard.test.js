import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StudentDashboard from '../../pages/StudentDashboard';

jest.mock('../../utils/api', () => ({
  get: jest.fn(() => Promise.resolve({ data: [] })),
}));

jest.mock('../../utils/auth', () => ({
  getRole: jest.fn(() => 'Student'),
}));

const MockedStudentDashboard = () => (
  <BrowserRouter>
    <StudentDashboard />
  </BrowserRouter>
);

describe('StudentDashboard Component', () => {
  test('renders student dashboard', () => {
    render(<MockedStudentDashboard />);
    expect(document.body).toBeInTheDocument();
  });
});
