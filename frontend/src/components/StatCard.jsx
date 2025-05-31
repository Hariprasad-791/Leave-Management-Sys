import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography } from '@mui/material';

const StatCard = ({ icon, title, value }) => (
  <Card elevation={3} sx={{ borderRadius: 2, height: '100%' }}>
    <CardContent sx={{ textAlign: 'center' }}>
      {icon}
      <Typography variant="h5" component="div">
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
    </CardContent>
  </Card>
);

// ✅ PropTypes added to fix SonarQube issues
StatCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default StatCard;
