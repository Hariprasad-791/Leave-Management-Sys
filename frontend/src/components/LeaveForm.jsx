import React, { useState } from 'react';
import {
  Paper, Typography, TextField, Button, Box,
  Alert, Grid, CircularProgress, Snackbar
} from '@mui/material';
import { CloudUpload, Send } from '@mui/icons-material';
import API from '../utils/api';

function LeaveForm() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    fromDate: '',
    toDate: '',
    document: null
  });

  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    if (e.target.name === 'document') {
      const file = e.target.files[0];
      setForm({ ...form, document: file });
      setFileName(file ? file.name : '');
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val) fd.append(key, val);
      });

      await API.post('/leave/submit', fd);
      setSuccess(true);
      setForm({
        title: '',
        description: '',
        fromDate: '',
        toDate: '',
        document: null
      });
      setFileName('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
        Apply for Leave
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Leave Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              variant="outlined"
              placeholder="E.g., Medical Leave, Family Emergency"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              multiline
              rows={4}
              variant="outlined"
              placeholder="Please provide details about your leave request"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="From Date"
              name="fromDate"
              type="date"
              value={form.fromDate}
              onChange={handleChange}

              required
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="To Date"
              name="toDate"
              type="date"
              value={form.toDate}
              onChange={handleChange}

              required
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUpload />}
              sx={{ mt: 1 }}
              fullWidth
            >
              <span>Upload Supporting Document</span>
              <input
                type="file"
                name="document"
                onChange={handleChange}
                hidden
              />
            </Button>
            {fileName && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Selected file: {fileName}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Send />}
              sx={{ mt: 2, py: 1.5 }}
            >
              {loading ? 'Submitting...' : 'Submit Leave Request'}
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        message="Leave request submitted successfully!"
      />
    </Paper>
  );
}

export default LeaveForm;
