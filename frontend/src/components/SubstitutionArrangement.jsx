import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, 
  FormControl, InputLabel, Select, MenuItem,
  Button, Alert, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField
} from '@mui/material';
import { Delete, Person, Schedule, Room } from '@mui/icons-material';
import API from '../utils/api';

const SubstitutionArrangement = ({ 
  startDate, 
  endDate, 
  onSubstitutionsChange,
  existingSubstitutions = [],
  department 
}) => {
  const [affectedClasses, setAffectedClasses] = useState([]);
  const [substitutions, setSubstitutions] = useState(existingSubstitutions);
  const [availableFaculty, setAvailableFaculty] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (startDate && endDate) {
      fetchAffectedClasses();
    }
  }, [startDate, endDate]);

  useEffect(() => {
    onSubstitutionsChange(substitutions);
  }, [substitutions, onSubstitutionsChange]);

  // Fix date formatting to handle both dayjs and Date objects
  const formatDateForAPI = (date) => {
    if (!date) return null;
    
    // Handle dayjs objects
    if (date && typeof date.format === 'function') {
      return date.format('YYYY-MM-DD');
    }
    
    // Handle JavaScript Date objects
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    // Handle string dates
    if (typeof date === 'string') {
      const dateObj = new Date(date);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    return null;
  };

  const fetchAffectedClasses = async () => {
    try {
      setLoading(true);
      setError('');
      
      const formattedStartDate = formatDateForAPI(startDate);
      const formattedEndDate = formatDateForAPI(endDate);
      
      console.log('Fetching classes for dates:', formattedStartDate, 'to', formattedEndDate);
      
      if (!formattedStartDate || !formattedEndDate) {
        setError('Invalid date format');
        return;
      }
      
      const response = await API.get('/substitution/timetable-for-dates', {
        params: { 
          startDate: formattedStartDate, 
          endDate: formattedEndDate 
        }
      });
      
      console.log('Affected classes response:', response.data);
      setAffectedClasses(response.data.affectedClasses || []);
      
      // Initialize substitutions for new classes
      const newSubstitutions = (response.data.affectedClasses || []).map(classItem => {
        const classDate = new Date(classItem.date);
        const formattedClassDate = classDate.toISOString().split('T')[0];
        
        const existing = substitutions.find(sub => 
          sub.date === formattedClassDate && 
          sub.timeSlot === classItem.timeSlot
        );
        
        return existing || {
          date: formattedClassDate,
          timeSlot: classItem.timeSlot,
          subject: classItem.subject,
          classroom: classItem.classroom,
          substituteTeacher: ''
        };
      });
      
      setSubstitutions(newSubstitutions);
    } catch (err) {
      console.error('Error fetching affected classes:', err);
      setError('Error fetching affected classes: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableFaculty = async (date, timeSlot) => {
    try {
      console.log('Fetching available faculty for:', date, timeSlot, department);
      
      const response = await API.get('/substitution/available', {
        params: { 
          date, 
          timeSlot, 
          department: department || 'Computer Science'
        }
      });
      
      console.log('Available faculty response:', response.data);
      
      setAvailableFaculty(prev => ({
        ...prev,
        [`${date}-${timeSlot}`]: response.data.availableFaculty || []
      }));
    } catch (err) {
      console.error('Error fetching available faculty:', err);
      setError('Error fetching available faculty: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubstituteChange = (index, substituteTeacherId) => {
    const updatedSubstitutions = [...substitutions];
    updatedSubstitutions[index].substituteTeacher = substituteTeacherId;
    setSubstitutions(updatedSubstitutions);
  };

  const handleFacultyDropdownOpen = (date, timeSlot) => {
    const key = `${date}-${timeSlot}`;
    if (!availableFaculty[key]) {
      fetchAvailableFaculty(date, timeSlot);
    }
  };

  const formatDisplayDate = (dateString) => {
    try {
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading affected classes...</Typography>
      </Box>
    );
  }

  if (affectedClasses.length === 0 && !loading) {
    return (
      <Box>
        <Alert severity="info" sx={{ mb: 2 }}>
          No classes found for the selected date range. Please ensure you have uploaded your timetable.
        </Alert>
        <Button 
          variant="outlined" 
          onClick={fetchAffectedClasses}
          sx={{ mt: 2 }}
        >
          Retry Fetching Classes
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Arrange Substitute Faculty
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Button 
            size="small" 
            onClick={fetchAffectedClasses}
            sx={{ ml: 2 }}
          >
            Retry
          </Button>
        </Alert>
      )}
      
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Time Slot</strong></TableCell>
              <TableCell><strong>Subject</strong></TableCell>
              <TableCell><strong>Classroom</strong></TableCell>
              <TableCell><strong>Substitute Faculty</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {substitutions.map((substitution, index) => {
              const key = `${substitution.date}-${substitution.timeSlot}`;
              const facultyOptions = availableFaculty[key] || [];
              
              return (
                <TableRow key={index}>
                  <TableCell>
                    <Chip 
                      icon={<Schedule />}
                      label={formatDisplayDate(substitution.date)}
                      size="small"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={substitution.timeSlot}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{substitution.subject}</TableCell>
                  <TableCell>
                    <Chip 
                      icon={<Room />}
                      label={substitution.classroom}
                      size="small"
                      color="secondary"
                    />
                  </TableCell>
                  <TableCell>
                    <FormControl fullWidth size="small">
                      <InputLabel>Select Faculty</InputLabel>
                      <Select
                        value={substitution.substituteTeacher}
                        onChange={(e) => handleSubstituteChange(index, e.target.value)}
                        onOpen={() => handleFacultyDropdownOpen(substitution.date, substitution.timeSlot)}
                        label="Select Faculty"
                      >
                        {facultyOptions.length === 0 ? (
                          <MenuItem disabled>
                            <Typography variant="body2" color="text.secondary">
                              Loading faculty...
                            </Typography>
                          </MenuItem>
                        ) : (
                          facultyOptions.map((faculty) => (
                            <MenuItem key={faculty._id} value={faculty._id}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Person fontSize="small" />
                                <Box>
                                  <Typography variant="body2">
                                    {faculty.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {faculty.department}
                                  </Typography>
                                </Box>
                              </Box>
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Alert severity="info">
        <Typography variant="body2">
          <strong>Note:</strong> All substitute faculty must accept their assignments before your leave can be forwarded to HOD for approval.
        </Typography>
      </Alert>
    </Box>
  );
};

export default SubstitutionArrangement;
