import React from 'react';
import Navbar from '../components/Navbar';
import LeaveForm from '../components/LeaveForm';
import LeaveList from '../components/LeaveList';

const StudentDashboard = () => {
  return (
    <div>
      <Navbar />
      <h2>Student Dashboard</h2>
      <LeaveForm />
      <LeaveList type="student" />
    </div>
  );
};

export default StudentDashboard;
