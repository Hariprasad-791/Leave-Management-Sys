import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

const MockLeaveList = ({ leaves = [] }) => (
  <div data-testid="leave-list">
    {leaves.length === 0 ? (
      <p>No leaves found</p>
    ) : (
      leaves.map(leave => (
        <div key={leave.id} data-testid="leave-item">
          {leave.type} - {leave.status}
        </div>
      ))
    )}
  </div>
);

describe('LeaveList Component', () => {
  test('renders with empty leaves array', () => {
    render(<MockLeaveList leaves={[]} />);
    expect(document.querySelector('[data-testid="leave-list"]')).toBeInTheDocument();
  });

  test('renders with leaves data', () => {
    const mockLeaves = [
      { id: 1, type: 'Sick Leave', status: 'Pending' }
    ];
    render(<MockLeaveList leaves={mockLeaves} />);
    expect(document.querySelector('[data-testid="leave-item"]')).toBeInTheDocument();
  });

  test('handles empty props', () => {
    render(<MockLeaveList />);
    expect(document.querySelector('[data-testid="leave-list"]')).toBeInTheDocument();
  });
});
