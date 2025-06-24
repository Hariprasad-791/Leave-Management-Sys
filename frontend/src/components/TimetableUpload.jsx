import React, { useState } from 'react';
import {
  Paper, Typography, Button, Box, Alert, 
  CircularProgress, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import { CloudUpload, Schedule, Download } from '@mui/icons-material';
import API from '../utils/api';

const TimetableUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [timetable, setTimetable] = useState({});

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an Excel file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('timetable', file);

      await API.post('/timetable/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      setFile(null);
      fetchTimetable(); // Refresh timetable display
      
      // Reset file input
      const fileInput = document.getElementById('timetable-upload');
      if (fileInput) fileInput.value = '';

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading timetable');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetable = async () => {
    try {
      const response = await API.get('/timetable/my-timetable');
      setTimetable(response.data.timetable);
    } catch (err) {
      console.error('Error fetching timetable:', err);
    }
  };

  React.useEffect(() => {
    fetchTimetable();
  }, []);

  const downloadTemplate = () => {
    // Create a sample Excel template
    const templateData = [
      ['Day', 'TimeSlot', 'Subject', 'Classroom'],
      ['Monday', '9:00-10:00', 'Mathematics', 'Room 101'],
      ['Monday', '10:00-11:00', 'Physics', 'Lab 1'],
      ['Tuesday', '9:00-10:00', 'Chemistry', 'Room 102'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Timetable');
    XLSX.writeFile(wb, 'timetable_template.xlsx');
  };

  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
          Upload Timetable
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Timetable uploaded successfully!</Alert>}

        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={downloadTemplate}
            sx={{ mb: 2 }}
          >
            Download Template
          </Button>
          <Typography variant="body2" color="text.secondary">
            Download the Excel template with the required format: Day, TimeSlot, Subject, Classroom
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <input
            id="timetable-upload"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <label htmlFor="timetable-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUpload />}
              fullWidth
              sx={{ mb: 2 }}
            >
              Choose Excel File
            </Button>
          </label>
          {file && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Selected: {file.name}
            </Typography>
          )}
        </Box>

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Schedule />}
          fullWidth
        >
          {loading ? 'Uploading...' : 'Upload Timetable'}
        </Button>
      </Paper>

      {Object.keys(timetable).length > 0 && (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            My Timetable
          </Typography>

          {daysOrder.map(day => (
            timetable[day] && (
              <Box key={day} sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1, color: 'secondary.main' }}>
                  {day}
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Time Slot</TableCell>
                        <TableCell>Subject</TableCell>
                        <TableCell>Classroom</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {timetable[day].map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Chip label={entry.timeSlot} size="small" color="primary" />
                          </TableCell>
                          <TableCell>{entry.subject}</TableCell>
                          <TableCell>{entry.classroom}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )
          ))}
        </Paper>
      )}
    </Box>
  );
};

export default TimetableUpload;
