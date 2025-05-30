import React, { useState, useEffect } from 'react';
import { Grid, Tabs, Tab, Paper, CircularProgress } from '@mui/material';
import { Add, ListAlt } from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import LeaveForm from '../components/LeaveForm';
import LeaveList from '../components/LeaveList';
import API from '../utils/api';

const StudentDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({ leaves: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/leave/status');
        setStats({ leaves: res.data.length });
      } catch (error) {
        console.error('Error fetching student leave stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleTabChange = (e, newValue) => setTabValue(newValue);

  return (
    <DashboardLayout title="Student Dashboard">
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={12}><StatCard icon={<ListAlt sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />} title="Total Leaves Applied" value={loading ? <CircularProgress size={24} /> : stats.leaves} /></Grid>
      </Grid>
      <Paper elevation={3} sx={{ borderRadius: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth" indicatorColor="primary" textColor="primary">
          <Tab icon={<Add />} label="Apply for Leave" />
          <Tab icon={<ListAlt />} label="My Leave History" />
        </Tabs>
        {tabValue === 0 && <LeaveForm />}
        {tabValue === 1 && <LeaveList type="status" />}
      </Paper>
    </DashboardLayout>
  );
};

export default StudentDashboard;
