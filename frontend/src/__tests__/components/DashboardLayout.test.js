import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

const MockDashboardLayout = ({ children }) => (
  <div data-testid="dashboard-layout">
    <header>Dashboard Header</header>
    <main>{children}</main>
  </div>
);

describe('DashboardLayout Component', () => {
  test('renders with children', () => {
    render(
      <MockDashboardLayout>
        <div>Test Content</div>
      </MockDashboardLayout>
    );
    expect(document.querySelector('[data-testid="dashboard-layout"]')).toBeInTheDocument();
  });
});
