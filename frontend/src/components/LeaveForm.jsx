import React, { useState } from 'react';
import {
  Paper, Typography, TextField, Button, Grid,
  MenuItem, Box, Alert, CircularProgress,
  Stepper, Step, StepLabel, StepContent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Send, CloudUpload } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import SubstitutionArrangement from './SubstitutionArrangement';
import API from '../utils/api';

const LeaveForm = () => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    startDate: null,
    endDate: null,
    reason: '',
    type: ''
  });
  const [substitutions, setSubstitutions] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const leaveTypes = [
    'Sick Leave', 'Casual Leave', 'Emergency Leave',
    'Maternity Leave', 'Paternity Leave', 'Study Leave'
  ];

  const steps = [
    'Leave Details',
    'Arrange Substitutions',
    'Review & Submit'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate step 1
      if (!formData.startDate || !formData.endDate || !formData.reason || !formData.type) {
        setError('Please fill in all required fields');
        return;
      }
      if (formData.endDate < formData.startDate) {
        setError('End date cannot be before start date');
        return;
      }
    }
    
    if (activeStep === 1) {
      // Validate substitutions
      const incompleteSubstitutions = substitutions.filter(sub => !sub.substituteTeacher);
      if (incompleteSubstitutions.length > 0) {
        setError('Please assign substitute faculty for all classes');
        return;
      }
    }

    setActiveStep(prev => prev + 1);
    setError('');
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const submitData = new FormData();
      submitData.append('startDate', formData.startDate.toISOString());
      submitData.append('endDate', formData.endDate.toISOString());
      submitData.append('reason', formData.reason);
      submitData.append('type', formData.type);
      submitData.append('substitutions', JSON.stringify(substitutions));
      
      if (file) {
        submitData.append('document', file);
      }

      await API.post('/leave/apply', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess(true);
      // Reset form
      setFormData({ startDate: null, endDate: null, reason: '', type: '' });
      setSubstitutions([]);
      setFile(null);
      setActiveStep(0);

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting leave application');
    } finally {
      setLoading(false);
    }
  };

  const canProceedToSubstitutions = () => {
    return formData.startDate && formData.endDate && formData.reason && formData.type;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
          Apply for Leave
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Leave application submitted successfully!</Alert>}

        <Stepper activeStep={activeStep} orientation="vertical">
          <Step>
            <StepLabel>Leave Details</StepLabel>
            <StepContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Start Date"
                    value={formData.startDate}
                    onChange={(date) => handleInputChange('startDate', date)}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                    minDate={new Date()}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="End Date"
                    value={formData.endDate}
                    onChange={(date) => handleInputChange('endDate', date)}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                    minDate={formData.startDate || new Date()}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    label="Leave Type"
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    fullWidth
                    required
                  >
                    {leaveTypes.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    style={{ display: 'none' }}
                    id="document-upload"
                  />
                  <label htmlFor="document-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUpload />}
                      fullWidth
                      sx={{ height: '56px' }}
                    >
                      Upload Document (Optional)
                    </Button>
                  </label>
                  {file && (
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      {file.name}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Reason for Leave"
                    value={formData.reason}
                    onChange={(e) => handleInputChange('reason', e.target.value)}
                    multiline
                    rows={3}
                    fullWidth
                    required
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!canProceedToSubstitutions()}
                >
                  Next
                </Button>
              </Box>
            </StepContent>
          </Step>

          <Step>
            <StepLabel>Arrange Substitutions</StepLabel>
            <StepContent>
              {canProceedToSubstitutions() && (
                <SubstitutionArrangement
                  startDate={formData.startDate}
                  endDate={formData.endDate}
                  onSubstitutionsChange={setSubstitutions}
                  department={user?.department}
                />
              )}
              <Box sx={{ mt: 2 }}>
                <Button onClick={handleBack} sx={{ mr: 1 }}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={substitutions.some(sub => !sub.substituteTeacher)}
                >
                  Next
                </Button>
              </Box>
            </StepContent>
          </Step>

          <Step>
            <StepLabel>Review & Submit</StepLabel>
            <StepContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Review Your Application</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography><strong>Leave Type:</strong> {formData.type}</Typography>
                    <Typography><strong>Start Date:</strong> {formData.startDate?.toLocaleDateString()}</Typography>
                    <Typography><strong>End Date:</strong> {formData.endDate?.toLocaleDateString()}</Typography>
                    <Typography><strong>Reason:</strong> {formData.reason}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>Substitutions Arranged:</Typography>
                    {substitutions.map((sub, index) => (
                      <Typography key={index} variant="body2">
                        {new Date(sub.date).toLocaleDateString()} - {sub.timeSlot} ({sub.subject})
                      </Typography>
                    ))}
                  </Grid>
                </Grid>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button onClick={handleBack} sx={{ mr: 1 }}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              </Box>
            </StepContent>
          </Step>
        </Stepper>
      </Paper>
    </LocalizationProvider>
  );
};

export default LeaveForm;
