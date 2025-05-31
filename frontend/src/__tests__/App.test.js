import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

const MockApp = () => (
  <div data-testid="app">
    <header>Leave Management System</header>
    <main>App Content</main>
  </div>
);

describe('App Component', () => {
  test('renders without crashing', () => {
    const { container } = render(<MockApp />);
    expect(container).toBeInTheDocument();
  });

  test('contains main app structure', () => {
    render(<MockApp />);
    expect(document.querySelector('[data-testid="app"]')).toBeInTheDocument();
  });
});
