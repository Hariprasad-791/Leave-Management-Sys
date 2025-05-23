import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Paper, Typography, Box, Card, CardContent, 
  Divider, CircularProgress, Tabs, Tab
} from '@mui/material';
import { Assignment, History, Add } from '@mui/icons-material';
import Navbar from '../components/Navbar';
import LeaveForm from '../components/LeaveForm';
import LeaveList from '../components/LeaveList';
import API from '../utils/api';

const StudentDashboard = () => {
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await API.get('/leave/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
          Student Dashboard
        </Typography>
        
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3} sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Leaves
                </Typography>
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
                    {stats.total}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3} sx={{ borderRadius: 2, height: '100%', bgcolor: '#e3f2fd' }}>
              <CardContent>
                <Typography color="primary" gutterBottom>
                  Pending
                </Typography>
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  <Typography variant="h3" component="div" color="primary" sx={{ fontWeight: 700 }}>
                    {stats.pending}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3} sx={{ borderRadius: 2, height: '100%', bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Typography color="success.main" gutterBottom>
                  Approved
                </Typography>
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  <Typography variant="h3" component="div" color="success.main" sx={{ fontWeight: 700 }}>
                    {stats.approved}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3} sx={{ borderRadius: 2, height: '100%', bgcolor: '#ffebee' }}>
              <CardContent>
                <Typography color="error" gutterBottom>
                  Rejected
                </Typography>
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  <Typography variant="h3" component="div" color="error" sx={{ fontWeight: 700 }}>
                    {stats.rejected}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Tabs for Leave Form and Leave List */}
        <Paper elevation={3} sx={{ borderRadius: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab icon={<Add />} label="Apply for Leave" />
            <Tab icon={<History />} label="My Leave History" />
          </Tabs>
          
          <Box sx={{ p: 3 }}>
            {tabValue === 0 ? (
              <LeaveForm />
            ) : (
              <LeaveList type="student" />
            )}
          </Box>
        </Paper>
      </Container>
      
      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', bgcolor: 'background.paper' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} Leave Management System
        </Typography>
      </Box>
    </Box>
  );
};

export default StudentDashboard;
