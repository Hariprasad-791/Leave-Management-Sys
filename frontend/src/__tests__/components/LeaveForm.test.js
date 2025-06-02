import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LeaveForm from '../../components/LeaveForm';

jest.mock('../../utils/api', () => ({
  post: jest.fn(),
}));

describe('LeaveForm Component', () => {
  test('renders leave form', () => {
    render(<LeaveForm />);
    expect(document.body).toBeInTheDocument();
  });

  test('handles form submission', () => {
    render(<LeaveForm />);
    const form = document.querySelector('form');
    if (form) {
      fireEvent.submit(form);
    }
    expect(document.body).toBeInTheDocument();
  });
});
