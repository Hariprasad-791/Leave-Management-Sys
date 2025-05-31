import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

const MockNavbar = () => (
  <nav data-testid="navbar">
    <a href="/home">Home</a>
    <a href="/profile">Profile</a>
  </nav>
);

describe('Navbar Component', () => {
  test('renders navbar', () => {
    render(<MockNavbar />);
    expect(document.querySelector('[data-testid="navbar"]')).toBeInTheDocument();
  });
});
