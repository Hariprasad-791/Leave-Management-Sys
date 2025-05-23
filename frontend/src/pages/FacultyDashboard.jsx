import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Paper, Grid, 
  Card, CardContent, Tabs, Tab, Divider,
  CircularProgress
} from '@mui/material';
import { 
  Add, ListAlt, School,
  Dashboard as DashboardIcon 
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import LeaveForm from '../components/LeaveForm';
import LeaveList from '../components/LeaveList';
import API from '../utils/api';

const FacultyDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    students: 0,
    pendingLeaves: 0,
    myLeaves: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // In a real app, you would have an API endpoint for these stats
        const proctorStudentsRes = await API.get('/users/my-students');
        const pendingLeavesRes = await API.get('/leave/proctor');
        const myLeavesRes = await API.get('/leave/status');
        
        setStats({
          students: proctorStudentsRes.data.length || 0,
          pendingLeaves: pendingLeavesRes.data.filter(l => l.status === 'Pending').length,
          myLeaves: myLeavesRes.data.length
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
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
          Faculty Dashboard
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={3} sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <School sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h5" component="div">
                  {loading ? <CircularProgress size={24} /> : stats.students}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Students Under Proctorship
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={3} sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <ListAlt sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h5" component="div">
                  {loading ? <CircularProgress size={24} /> : stats.pendingLeaves}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Student Leaves
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={3} sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <ListAlt sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                <Typography variant="h5" component="div">
                  {loading ? <CircularProgress size={24} /> : stats.myLeaves}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  My Leave Requests
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
            <Tab icon={<Add />} label="Apply for Leave" />
            <Tab icon={<ListAlt />} label="Student Leave Requests" />
            <Tab icon={<ListAlt />} label="My Leaves" />
          </Tabs>
          
          <Box sx={{ p: 3 }}>
            {tabValue === 0 ? (
              <LeaveForm />
            ) : tabValue === 1 ? (
              <LeaveList type="proctor" />
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

export default FacultyDashboard;
