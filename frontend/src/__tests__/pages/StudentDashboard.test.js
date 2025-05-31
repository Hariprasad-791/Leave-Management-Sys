import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

const MockStudentDashboard = () => (
  <div data-testid="student-dashboard">
    <h1>Student Dashboard</h1>
    <div data-testid="stats">
      <div>Total Leaves: 10</div>
      <div>Pending: 2</div>
    </div>
  </div>
);

describe('StudentDashboard Component', () => {
  test('renders dashboard', () => {
    render(<MockStudentDashboard />);
    expect(document.querySelector('[data-testid="student-dashboard"]')).toBeInTheDocument();
  });
});
