import React from 'react';
import PropTypes from 'prop-types';
import { Container, Typography, Box } from '@mui/material';
import Navbar from './Navbar';

const DashboardLayout = ({ title, children }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Navbar />
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
        {title}
      </Typography>
      {children}
    </Container>
  </Box>
);

// ✅ Add prop validation
DashboardLayout.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default DashboardLayout;
