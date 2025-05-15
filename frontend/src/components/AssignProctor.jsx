import React, { useEffect, useState } from 'react';
import API from '../utils/api';

const AssignProctor = () => {
  const [students, setStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const allUsers = await API.get('/users');
      setStudents(allUsers.data.filter(u => u.role === 'Student' && !u.proctor));
      setFaculties(allUsers.data.filter(u => u.role === 'Faculty'));
    };
    fetchData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await API.post('/users/assign-proctor', {
        studentId: selectedStudent,
        facultyId: selectedFaculty,
      });
      alert('Proctor assigned successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Error assigning proctor');
    }
  };

  return (
    <form onSubmit={handleAssign}>
      <h3>Assign Proctor</h3>
      <select onChange={(e) => setSelectedStudent(e.target.value)} required>
        <option value="">Select Student</option>
        {students.map(s => (
          <option key={s._id} value={s._id}>{s.name} - {s.email}</option>
        ))}
      </select>

      <select onChange={(e) => setSelectedFaculty(e.target.value)} required>
        <option value="">Select Faculty</option>
        {faculties.map(f => (
          <option key={f._id} value={f._id}>{f.name} - {f.email}</option>
        ))}
      </select>

      <button type="submit">Assign</button>
    </form>
  );
};

export default AssignProctor;
