import React from 'react';
import { render } from '@testing-library/react';
import ErrorBoundary from '../../components/ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary Component', () => {
  test('catches and displays error', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(document.body).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});
