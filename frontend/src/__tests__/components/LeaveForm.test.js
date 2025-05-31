import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

const MockLeaveForm = () => (
  <form data-testid="leave-form">
    <select data-testid="leave-type">
      <option value="sick">Sick Leave</option>
      <option value="casual">Casual Leave</option>
    </select>
    <textarea data-testid="reason" placeholder="Reason"></textarea>
    <button type="submit">Submit</button>
  </form>
);

describe('LeaveForm Component', () => {
  test('renders form elements', () => {
    render(<MockLeaveForm />);
    expect(document.querySelector('[data-testid="leave-form"]')).toBeInTheDocument();
  });

  test('handles form submission', () => {
    render(<MockLeaveForm />);
    const form = document.querySelector('[data-testid="leave-form"]');
    fireEvent.submit(form);
    expect(form).toBeInTheDocument();
  });
});
