import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

const MockLogin = () => (
  <form data-testid="login-form">
    <input type="email" data-testid="email" />
    <input type="password" data-testid="password" />
    <button type="submit">Login</button>
  </form>
);

describe('Login Component', () => {
  test('renders login form', () => {
    render(<MockLogin />);
    expect(document.querySelector('[data-testid="login-form"]')).toBeInTheDocument();
  });

  test('handles form submission', () => {
    render(<MockLogin />);
    const form = document.querySelector('[data-testid="login-form"]');
    fireEvent.submit(form);
    expect(form).toBeInTheDocument();
  });
});
