// components/ErrorBoundary.js
import React from 'react';
import PropTypes from 'prop-types'; // ✅ Import PropTypes

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h3>Something went wrong. Please try again later.</h3>;
    }

    return this.props.children;
  }
}

// ✅ Add this to declare prop types
ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
