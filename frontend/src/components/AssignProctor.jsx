import React, { useEffect, useState } from 'react';
import { 
  Paper, Typography, FormControl, InputLabel, Select, 
  MenuItem, Button, Box, Alert, CircularProgress 
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import API from '../utils/api';

const AssignProctor = () => {
  const [students, setStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const allUsers = await API.get('users');
        setStudents(allUsers.data.filter(u => u.role === 'Student' && !u.proctor));
        setFaculties(allUsers.data.filter(u => u.role === 'Faculty'));
        setError('');
      } catch (err) {
        setError('Failed to load users. Please try again.');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    
    if (!selectedStudent || !selectedFaculty) {
      setError('Please select both a student and a faculty member');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      await API.post('/users/assign-proctor', {
        studentId: selectedStudent,
        facultyId: selectedFaculty,
      });
      
      setSuccess(true);
      setSelectedStudent('');
      setSelectedFaculty('');
      
      // Refresh student list after assignment
      const allUsers = await API.get('users');
      setStudents(allUsers.data.filter(u => u.role === 'Student' && !u.proctor));
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error assigning proctor');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
        Assign Proctor to Student
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Proctor assigned successfully!</Alert>}
      
      <Box component="form" onSubmit={handleAssign} sx={{ mt: 2 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="student-select-label">Select Student</InputLabel>
          <Select
            labelId="student-select-label"
            id="student-select"
            value={selectedStudent}
            label="Select Student"
            onChange={(e) => setSelectedStudent(e.target.value)}
            disabled={loading || submitting}
          >
            <MenuItem value="">
              <em>Select a student</em>
            </MenuItem>
            {students.map(student => (
              <MenuItem key={student._id} value={student._id}>
                {student.name} - {student.email}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="faculty-select-label">Select Faculty</InputLabel>
          <Select
            labelId="faculty-select-label"
            id="faculty-select"
            value={selectedFaculty}
            label="Select Faculty"
            onChange={(e) => setSelectedFaculty(e.target.value)}
            disabled={loading || submitting}
          >
            <MenuItem value="">
              <em>Select a faculty member</em>
            </MenuItem>
            {faculties.map(faculty => (
              <MenuItem key={faculty._id} value={faculty._id}>
                {faculty.name} - {faculty.email}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Button
          type="submit"
          variant="contained"
          startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <PersonAdd />}
          disabled={loading || submitting}
          fullWidth
          sx={{ py: 1.5 }}
        >
          {submitting ? 'Assigning...' : 'Assign Proctor'}
        </Button>
      </Box>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Paper>
  );
};

export default AssignProctor;
