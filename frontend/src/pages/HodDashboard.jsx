import React from 'react';
import Navbar from '../components/Navbar';
import AssignProctor from '../components/AssignProctor';
import LeaveList from '../components/LeaveList';

const HodDashboard = () => {
  console.log("Navbar:", Navbar);
console.log("AssignProctor:", AssignProctor);
console.log("LeaveList:", LeaveList);

  return (
      <div>
        <Navbar />
        <h2>HOD Dashboard</h2>
        <AssignProctor />
        <LeaveList type="hod" />
      </div>
  );
};

export default HodDashboard;
