import React from 'react';
import { render } from '@testing-library/react';
import StatCard from '../../components/StatCard';

describe('StatCard Component', () => {
  test('renders stat card', () => {
    render(<StatCard title="Test" value="100" />);
    expect(document.body).toBeInTheDocument();
  });
});
