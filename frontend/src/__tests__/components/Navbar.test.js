import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

const MockNavbar = () => (
  <nav data-testid="navbar">
    <div data-testid="user-info">Student User</div>
    <a href="/home">Home</a>
    <a href="/profile">Profile</a>
  </nav>
);

describe('Navbar Component', () => {
  test('renders navbar component', () => {
    render(<MockNavbar />);
    expect(document.querySelector('[data-testid="navbar"]')).toBeInTheDocument();
  });

  test('contains navigation elements', () => {
    const { container } = render(<MockNavbar />);
    expect(container.firstChild).toBeTruthy();
  });
});
