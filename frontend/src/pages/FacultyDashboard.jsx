import React, { useState, useEffect } from 'react';
import { Grid, Tabs, Tab, Paper, CircularProgress } from '@mui/material';
import { Add, ListAlt, School } from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import LeaveForm from '../components/LeaveForm';
import LeaveList from '../components/LeaveList';
import API from '../utils/api';

const FacultyDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({ students: 0, pendingLeaves: 0, myLeaves: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, pendingRes, myLeavesRes] = await Promise.all([
          API.get('/users/my-students'),
          API.get('/leave/proctor'),
          API.get('/leave/status')
        ]);
        setStats({
          students: studentsRes.data.length || 0,
          pendingLeaves: pendingRes.data.filter(l => l.status === 'Pending').length,
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

  const handleTabChange = (e, newValue) => setTabValue(newValue);

  return (
    <DashboardLayout title="Faculty Dashboard">
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}><StatCard icon={<School sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />} title="Students Under Proctorship" value={loading ? <CircularProgress size={24} /> : stats.students} /></Grid>
        <Grid item xs={12} sm={4}><StatCard icon={<ListAlt sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />} title="Pending Student Leaves" value={loading ? <CircularProgress size={24} /> : stats.pendingLeaves} /></Grid>
        <Grid item xs={12} sm={4}><StatCard icon={<ListAlt sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />} title="My Leave Requests" value={loading ? <CircularProgress size={24} /> : stats.myLeaves} /></Grid>
      </Grid>
      <Paper elevation={3} sx={{ borderRadius: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth" indicatorColor="primary" textColor="primary">
          <Tab icon={<Add />} label="Apply for Leave" />
          <Tab icon={<ListAlt />} label="My Leaves" />
          <Tab icon={<School />} label="Student Leaves" />
        </Tabs>
        {tabValue === 0 && <LeaveForm />}
        {tabValue === 1 && <LeaveList type="status" />}
        {tabValue === 2 && <LeaveList type="proctor" />}
      </Paper>
    </DashboardLayout>
  );
};

export default FacultyDashboard;