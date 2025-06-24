import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid,
  Button, Alert, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton
} from '@mui/material';
import { 
  CheckCircle, Cancel, Person, Schedule, 
  Room, CalendarToday, Subject 
} from '@mui/icons-material';
import API from '../utils/api';

const SubstitutionRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseDialog, setResponseDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    fetchSubstitutionRequests();
  }, []);

  const fetchSubstitutionRequests = async () => {
    try {
      const response = await API.get('/substitution/requests');
      setRequests(response.data.substitutionRequests);
    } catch (error) {
      console.error('Error fetching substitution requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (response) => {
    try {
      setResponding(true);
      await API.post('/substitution/respond', {
        leaveId: selectedRequest.leaveId,
        substitutionId: selectedRequest.substitutionId,
        response,
        rejectionReason: response === 'Rejected' ? rejectionReason : undefined
      });

      // Remove the request from the list
      setRequests(prev => prev.filter(req => req.substitutionId !== selectedRequest.substitutionId));
      setResponseDialog(false);
      setSelectedRequest(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error responding to substitution:', error);
    } finally {
      setResponding(false);
    }
  };

  const openResponseDialog = (request) => {
    setSelectedRequest(request);
    setResponseDialog(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <Typography>Loading substitution requests...</Typography>;
  }

  if (requests.length === 0) {
    return (
      <Alert severity="info">
        No pending substitution requests.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Substitution Requests
      </Typography>

      <Grid container spacing={3}>
        {requests.map((request) => (
          <Grid item xs={12} key={request.substitutionId}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" color="primary">
                      Substitution Request
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      From: {request.applicant.name} ({request.applicant.department})
                    </Typography>
                  </Box>
                  <Chip 
                    label={request.leaveType}
                    color="primary"
                    size="small"
                  />
                </Box>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Leave Period:</strong> {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        <strong>Reason:</strong> {request.leaveReason}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="secondary" gutterBottom>
                      Class Details:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Schedule fontSize="small" color="action" />
                      <Typography variant="body2">
                        {formatDate(request.substitution.date)} - {request.substitution.timeSlot}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Subject fontSize="small" color="action" />
                      <Typography variant="body2">
                        {request.substitution.subject}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Room fontSize="small" color="action" />
                      <Typography variant="body2">
                        {request.substitution.classroom}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => openResponseDialog(request)}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => {
                      setSelectedRequest(request);
                      handleResponse('Accepted');
                    }}
                  >
                    Accept
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Response Dialog */}
      <Dialog open={responseDialog} onClose={() => setResponseDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Substitution Request</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this substitution request:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResponseDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => handleResponse('Rejected')}
            color="error"
            disabled={!rejectionReason.trim() || responding}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubstitutionRequests;
