import React from 'react';
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

export default StatCard;