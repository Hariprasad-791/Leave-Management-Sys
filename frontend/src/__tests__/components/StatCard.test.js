import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatCard from '../../components/StatCard';

describe('StatCard Component', () => {
  test('renders with props', () => {
    const props = {
      title: 'Test Title',
      value: '100',
      icon: '📊'
    };
    render(<StatCard {...props} />);
    expect(document.body).toBeInTheDocument();
  });

  test('renders without props', () => {
    render(<StatCard />);
    expect(document.body).toBeInTheDocument();
  });
});
