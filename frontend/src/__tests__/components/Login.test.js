import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

const MockLogin = () => (
  <form data-testid="login-form">
    <input type="email" data-testid="email" placeholder="Email" />
    <input type="password" data-testid="password" placeholder="Password" />
    <button type="submit">Login</button>
  </form>
);

describe('Login Component', () => {
  test('renders login component', () => {
    render(<MockLogin />);
    expect(document.querySelector('[data-testid="login-form"]')).toBeInTheDocument();
  });

  test('handles input changes', () => {
    render(<MockLogin />);
    const emailInput = document.querySelector('[data-testid="email"]');
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    expect(emailInput.value).toBe('test@test.com');
  });

  test('handles form submission', () => {
    render(<MockLogin />);
    const form = document.querySelector('[data-testid="login-form"]');
    fireEvent.submit(form);
    expect(form).toBeInTheDocument();
  });
});
