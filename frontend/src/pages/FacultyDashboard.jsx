import React from 'react';
import Navbar from '../components/Navbar';
import LeaveList from '../components/LeaveList';
import LeaveForm from '../components/LeaveForm'; // ✅ same form used by students

const FacultyDashboard = () => {
  return (
    <div>
      <Navbar />
      <h2>Faculty Dashboard</h2>

      <h3>Apply for Leave</h3>
      <LeaveForm /> {/* ✅ Faculty can now submit leave */}

      <h3>Student Leave Requests (for Approval)</h3>
      <LeaveList type="proctor" />
    </div>
  );
};

export default FacultyDashboard;
