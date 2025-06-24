import React, { useState } from 'react';
import {
  Container, Typography, Box, Paper, Grid,
  Card, CardContent, Divider, Tabs, Tab
} from '@mui/material';
import {
  Person, School, SupervisorAccount,
  Engineering, Group, Settings
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import Signup from '../components/Signup';
import UserManagement from '../components/UserManagement';

function AdminDashboard() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
          Admin Dashboard
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3} sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Person sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h5" component="div">
                  Users
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage all system users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3} sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <School sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h5" component="div">
                  Students
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Student management
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3} sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Engineering sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h5" component="div">
                  Faculty
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Faculty management
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3} sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <SupervisorAccount sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h5" component="div">
                  HODs
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Department heads
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Paper elevation={3} sx={{ borderRadius: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab icon={<Group />} label="User Management" />
            <Tab icon={<Person />} label="Create User" />
          </Tabs>
          
          {tabValue === 0 && (
            <Box sx={{ p: 3 }}>
              <UserManagement />
            </Box>
          )}
          
          {tabValue === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ 
                fontWeight: 600, color: 'primary.main', mb: 3 
              }}>
                Create New User
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Signup />
            </Box>
          )}
        </Paper>
      </Container>

      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', bgcolor: 'background.paper' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} Leave Management System
        </Typography>
      </Box>
    </Box>
  );
}

export default AdminDashboard;
