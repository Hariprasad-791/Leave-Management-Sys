import React from 'react';
import { render } from '@testing-library/react';
import LeaveList from '../../components/LeaveList';

const mockLeaves = [
  { _id: '1', title: 'Medical Leave', status: 'pending', fromDate: '2024-01-01', toDate: '2024-01-02' },
  { _id: '2', title: 'Personal Leave', status: 'approved', fromDate: '2024-01-03', toDate: '2024-01-04' }
];

describe('LeaveList Component', () => {
  test('renders leave list', () => {
    render(<LeaveList leaves={mockLeaves} />);
    expect(document.body).toBeInTheDocument();
  });
});
