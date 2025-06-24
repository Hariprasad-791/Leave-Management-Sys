import React, { useState, useEffect } from 'react';
import { Grid, Tabs, Tab, Paper, CircularProgress } from '@mui/material';
import { Add, ListAlt, School, Schedule, SwapHoriz } from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import LeaveForm from '../components/LeaveForm';
import LeaveList from '../components/LeaveList';
import TimetableUpload from '../components/TimetableUpload';
import SubstitutionRequests from '../components/SubstitutionRequests';
import API from '../utils/api';

const FacultyDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({ 
    students: 0, 
    pendingLeaves: 0, 
    myLeaves: 0,
    substitutionRequests: 0 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, pendingRes, myLeavesRes, substitutionRes] = await Promise.all([
          API.get('/users/my-students'),
          API.get('/leave/proctor'),
          API.get('/leave/status'),
          API.get('/substitution/requests')
        ]);
        setStats({
          students: studentsRes.data.length || 0,
          pendingLeaves: pendingRes.data.filter(l => l.status === 'Pending').length,
          myLeaves: myLeavesRes.data.length,
          substitutionRequests: substitutionRes.data.substitutionRequests.length
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleTabChange = (e, newValue) => setTabValue(newValue);

  return (
    <DashboardLayout title="Faculty Dashboard">
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <StatCard 
            icon={<School sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />} 
            title="Students Under Proctorship" 
            value={loading ? <CircularProgress size={24} /> : stats.students} 
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <StatCard 
            icon={<ListAlt sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />} 
            title="Pending Student Leaves" 
            value={loading ? <CircularProgress size={24} /> : stats.pendingLeaves} 
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <StatCard 
            icon={<ListAlt sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />} 
            title="My Leave Requests" 
            value={loading ? <CircularProgress size={24} /> : stats.myLeaves} 
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <StatCard 
            icon={<SwapHoriz sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />} 
            title="Substitution Requests" 
            value={loading ? <CircularProgress size={24} /> : stats.substitutionRequests} 
          />
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
          <Tab icon={<ListAlt />} label="My Leaves" />
          <Tab icon={<School />} label="Student Leaves" />
          <Tab icon={<Schedule />} label="My Timetable" />
          <Tab icon={<SwapHoriz />} label="Substitution Requests" />
        </Tabs>
        {tabValue === 0 && <LeaveForm />}
        {tabValue === 1 && <LeaveList type="status" />}
        {tabValue === 2 && <LeaveList type="proctor" />}
        {tabValue === 3 && <TimetableUpload />}
        {tabValue === 4 && <SubstitutionRequests />}
      </Paper>
    </DashboardLayout>
  );
};

export default FacultyDashboard;
