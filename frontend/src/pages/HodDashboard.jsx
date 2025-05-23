import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Paper, Grid, 
  Card, CardContent, Tabs, Tab, Divider,
  CircularProgress
} from '@mui/material';
import { 
  PersonAdd, ListAlt, School,
  Engineering, Dashboard as DashboardIcon 
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import AssignProctor from '../components/AssignProctor';
import LeaveList from '../components/LeaveList';
import API from '../utils/api';

const HodDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    students: 0,
    faculty: 0,
    pendingLeaves: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // In a real app, you would have an API endpoint for these stats
        const usersRes = await API.get('/users');
        const leavesRes = await API.get('/leave/department');
        
        const students = usersRes.data.filter(u => u.role === 'Student').length;
        const faculty = usersRes.data.filter(u => u.role === 'Faculty').length;
        const pendingLeaves = leavesRes.data.filter(l => l.status === 'Pending').length;
        
        setStats({
          students,
          faculty,
          pendingLeaves
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
          HOD Dashboard
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
                  Students in Department
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={3} sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Engineering sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h5" component="div">
                  {loading ? <CircularProgress size={24} /> : stats.faculty}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Faculty Members
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
                  Pending Leave Requests
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
            <Tab icon={<PersonAdd />} label="Assign Proctor" />
            <Tab icon={<ListAlt />} label="Leave Requests" />
          </Tabs>
          
          <Box sx={{ p: 3 }}>
            {tabValue === 0 ? (
              <AssignProctor />
            ) : (
              <LeaveList type="hod" />
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

export default HodDashboard;
