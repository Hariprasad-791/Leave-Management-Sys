import React, { useEffect, useState } from 'react';
import API from '../utils/api';

const LeaveList = ({ type }) => {
  const [leaves, setLeaves] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [comments, setComments] = useState({});
  const [subs, setSubs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaves = async () => {
      setLoading(true);
      try {
        let url = '/leave/status';
        if (type === 'proctor') url = '/leave/proctor';
        else if (type === 'hod') url = '/leave/department';

        const res = await API.get(url);
        setLeaves(res.data);

        if (type === 'hod') {
          const facultyRes = await API.get('/users');
          // Filter out faculty who are currently on leave
          const facultyList = facultyRes.data.filter(u => {
            return u.role === 'Faculty' && !u.isInLeave;
          });
          setFaculties(facultyList);
        }
        setError(null);
      } catch (error) {
        console.error('Error fetching leaves', error);
        setError('Failed to load leave requests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, [type]);

  const handleAction = async (leaveId, action) => {
    try {
      const payload = {
        leaveId,
        approvalStatus: action,
        comments: comments[leaveId] || '',
        substituteProctorId: subs[leaveId] || null,
      };
      
      // Validate if substitute proctor is required but not selected
      if (type === 'hod' && 
          leaves.find(l => l._id === leaveId)?.isFacultyLeave && 
          action === 'Approved' && 
          !subs[leaveId]) {
        alert('Please select a substitute proctor for faculty leave');
        return;
      }
      
      await API.post('/leave/approve', payload);
      alert(`Leave ${action} successfully`);
      
      // Refresh the leave list instead of full page reload
      const updatedLeaves = leaves.map(leave => {
        if (leave._id === leaveId) {
          return { ...leave, status: action };
        }
        return leave;
      });
      setLeaves(updatedLeaves);
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  if (loading) return <div>Loading leave requests...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="leave-list-container">
      <h3>Leave Requests</h3>
      {leaves.length === 0 ? <p>No leaves found.</p> : (
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>Title</th>
              <th>Student/Faculty</th>
              <th>Department</th>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
              <th>Document</th>
              <th>Comments</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => (
              <tr key={leave._id}>
                <td>{leave.title}</td>
                <td>
                  {leave.student ? (
                    <div>
                      <div><strong>Name:</strong> {leave.student.name}</div>
                      <div><strong>Email:</strong> {leave.student.email}</div>
                      <div><strong>Role:</strong> {leave.student.role}</div>
                    </div>
                  ) : '-'}
                </td>
                <td>{leave.department}</td>
                <td>{leave.fromDate.slice(0, 10)}</td>
                <td>{leave.toDate.slice(0, 10)}</td>
                <td>{leave.status}</td>
                <td>
                  {leave.documentUrl ? (
                    <a 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(leave.documentUrl, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      View PDF
                    </a>
                  ) : 'No Document'}
                </td>
                <td>{leave.comments || leave.rejectionReason || '-'}</td>
                <td>
                  {(type === 'proctor' || type === 'hod') && leave.status === 'Pending' && (
                    <div className="action-controls">
                      <textarea
                        placeholder="Comment"
                        rows={2}
                        onChange={(e) => setComments({ ...comments, [leave._id]: e.target.value })}
                      />

                      {type === 'hod' && leave.isFacultyLeave && (
                        <select
                          onChange={(e) => setSubs({ ...subs, [leave._id]: e.target.value })}
                          required
                        >
                          <option value="">Select Substitute</option>
                          {faculties.map(fac => (
                            <option key={fac._id} value={fac._id}>
                              {fac.name} - {fac.email}
                            </option>
                          ))}
                        </select>
                      )}

                      <div className="action-buttons">
                        <button 
                          className="approve-btn" 
                          onClick={() => handleAction(leave._id, 'Approved')}
                        >
                          Approve
                        </button>
                        <button 
                          className="reject-btn" 
                          onClick={() => handleAction(leave._id, 'Rejected')}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LeaveList;
