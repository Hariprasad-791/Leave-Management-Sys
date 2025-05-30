import React, { useState, useEffect } from 'react';
import { Grid, Paper, Tabs, Tab, CircularProgress } from '@mui/material';
import { ListAlt, Group, Approval } from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import LeaveList from '../components/LeaveList';
import AssignProctor from '../components/AssignProctor';
import API from '../utils/api';

const HodDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({ faculties: 0, departmentLeaves: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, leavesRes] = await Promise.all([
          API.get('/users'),
          API.get('/leave/department')
        ]);
        const facultyCount = usersRes.data.filter(u => u.role === 'Faculty').length;
        setStats({
          faculties: facultyCount,
          departmentLeaves: leavesRes.data.length
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleTabChange = (e, newValue) => setTabValue(newValue);

  return (
    <DashboardLayout title="HOD Dashboard">
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}><StatCard icon={<Group sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />} title="Faculties" value={loading ? <CircularProgress size={24} /> : stats.faculties} /></Grid>
        <Grid item xs={12} sm={6}><StatCard icon={<Approval sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />} title="Department Leaves" value={loading ? <CircularProgress size={24} /> : stats.departmentLeaves} /></Grid>
      </Grid>
      <Paper elevation={3} sx={{ borderRadius: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth" indicatorColor="primary" textColor="primary">
          <Tab icon={<ListAlt />} label="Department Leaves" />
          <Tab icon={<Group />} label="Assign Proctor" />
        </Tabs>
        {tabValue === 0 && <LeaveList type="hod" />}
        {tabValue === 1 && <AssignProctor />}
      </Paper>
    </DashboardLayout>
  );
};

export default HodDashboard;