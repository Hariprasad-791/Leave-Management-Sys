import React, { useEffect, useState } from 'react';
import {
  Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, TextField, Select, MenuItem,
  FormControl, InputLabel, CircularProgress, Box, Alert, Dialog,
  DialogTitle, DialogContent, DialogActions, IconButton, Tooltip,
  TablePagination, LinearProgress, Grid
} from '@mui/material';

import {
  CheckCircle, Cancel, RemoveRedEye,
  Assignment, Close, Refresh
} from '@mui/icons-material';
import API from '../utils/api';
import PropTypes from 'prop-types';

const LeaveList = ({ type }) => {
  const [leaves, setLeaves] = useState([]);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      let url = '/leave/status';
      if (type === 'proctor') url = '/leave/proctor';
      else if (type === 'hod') url = '/leave/hod'; // Fixed to use correct HOD endpoint

      const res = await API.get(url);
      setLeaves(res.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching leaves', error);
      setError('Failed to load leave requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [type]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLeaves();
    setRefreshing(false);
  };

  // Updated HOD action handler - removed substitute proctor logic
  const handleHODAction = async (leaveId, action) => {
    try {
      setActionLoading(true);
      
      const payload = {
        action: action, // 'Approved' or 'Rejected'
        comments: comments[leaveId] || ''
      };

      await API.put(`/leave/${leaveId}/hod-action`, payload);

      // Refresh the leave list
      await fetchLeaves();
      setOpenDialog(false);
      setComments({});
      
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Legacy action handler for proctor approval
  const handleProctorAction = async (leaveId, action) => {
    try {
      setActionLoading(true);
      
      const payload = {
        leaveId,
        approvalStatus: action,
        comments: comments[leaveId] || ''
      };

      await API.post('/leave/approve', payload);

      // Refresh the leave list
      await fetchLeaves();
      setOpenDialog(false);
      setComments({});

    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const openLeaveDetails = (leave) => {
    setSelectedLeave(leave);
    setOpenDialog(true);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'Approved':
        return <Chip label="Approved" color="success" size="small" icon={<CheckCircle />} />;
      case 'Rejected':
        return <Chip label="Rejected" color="error" size="small" icon={<Cancel />} />;
      case 'Pending_HOD':
        return <Chip label="Pending HOD" color="warning" size="small" />;
      case 'Pending_Substitution':
        return <Chip label="Pending Substitution" color="info" size="small" />;
      case 'Draft':
        return <Chip label="Draft" color="default" size="small" />;
      case 'Pending':
        return <Chip label="Pending" color="warning" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading && !refreshing) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: 'primary.main' }}>
          Leave Requests
        </Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={handleRefresh} disabled={refreshing}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {refreshing && <LinearProgress sx={{ mb: 2 }} />}

      {leaves.length === 0 ? (
        <Alert severity="info">No leave requests found.</Alert>
      ) : (
        <>
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell><Typography variant="subtitle2">Type</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2">Applicant</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2">From</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2">To</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2">Status</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2">Actions</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaves
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((leave) => (
                    <TableRow key={leave._id} hover>
                      <TableCell>{leave.type || 'N/A'}</TableCell>
                      <TableCell>{leave.user?.name || 'N/A'}</TableCell>
                      <TableCell>{formatDate(leave.startDate)}</TableCell>
                      <TableCell>{formatDate(leave.endDate)}</TableCell>
                      <TableCell>{getStatusChip(leave.status)}</TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => openLeaveDetails(leave)}
                          >
                            <RemoveRedEye />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={leaves.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}

      {/* Leave Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedLeave && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">{selectedLeave.type || 'Leave Request'}</Typography>
              <IconButton onClick={() => setOpenDialog(false)}>
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Requester</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedLeave.user?.name || 'N/A'} ({selectedLeave.user?.role || 'N/A'})
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedLeave.user?.email || 'N/A'}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">Department</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedLeave.user?.department || 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">From Date</Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(selectedLeave.startDate)}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">To Date</Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(selectedLeave.endDate)}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Typography variant="body1" gutterBottom>
                    {getStatusChip(selectedLeave.status)}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Reason</Typography>
                  <Typography variant="body1" component="p">
                    {selectedLeave.reason || 'No reason provided.'}
                  </Typography>
                </Grid>

                {selectedLeave.document && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Supporting Document</Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Assignment />}
                      size="small"
                      onClick={() => window.open(selectedLeave.document, '_blank', 'noopener, noreferrer')}
                      sx={{ mt: 1 }}
                    >
                      View Document
                    </Button>
                  </Grid>
                )}

                {/* Show substitutions if any */}
                {selectedLeave.substitutions && selectedLeave.substitutions.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Substitutions Arranged</Typography>
                    <Box sx={{ mt: 1 }}>
                      {selectedLeave.substitutions.map((sub, index) => (
                        <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="body2">
                            <strong>{formatDate(sub.date)}</strong> - {sub.timeSlot} - {sub.subject} ({sub.classroom})
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Substitute: {sub.substituteTeacher?.name || 'Not assigned'} - Status: {sub.status}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                )}

                {selectedLeave.hodComments && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">HOD Comments</Typography>
                    <Typography variant="body1">
                      {selectedLeave.hodComments}
                    </Typography>
                  </Grid>
                )}

                {selectedLeave.proctorComments && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Proctor Comments</Typography>
                    <Typography variant="body1">
                      {selectedLeave.proctorComments}
                    </Typography>
                  </Grid>
                )}

                {/* Action section for HOD - REMOVED substitute proctor field */}
                {type === 'hod' && (selectedLeave.status === 'Pending_HOD' || selectedLeave.status === 'Pending') && (
                  <Grid item xs={12}>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Add Comments
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Add your comments here..."
                        variant="outlined"
                        value={comments[selectedLeave._id] || ''}
                        onChange={(e) => setComments({ ...comments, [selectedLeave._id]: e.target.value })}
                      />
                    </Box>
                  </Grid>
                )}

                {/* Action section for Proctor */}
                {type === 'proctor' && selectedLeave.status === 'Pending' && (
                  <Grid item xs={12}>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Add Comments
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Add your comments here..."
                        variant="outlined"
                        value={comments[selectedLeave._id] || ''}
                        onChange={(e) => setComments({ ...comments, [selectedLeave._id]: e.target.value })}
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>

            {/* Action buttons for HOD - SIMPLIFIED */}
            {type === 'hod' && (selectedLeave.status === 'Pending_HOD' || selectedLeave.status === 'Pending') && (
              <DialogActions sx={{ p: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleHODAction(selectedLeave._id, 'Rejected')}
                  startIcon={<Cancel />}
                  disabled={actionLoading}
                >
                  Reject
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleHODAction(selectedLeave._id, 'Approved')}
                  startIcon={<CheckCircle />}
                  disabled={actionLoading}
                >
                  {actionLoading ? <CircularProgress size={20} /> : 'Approve'}
                </Button>
              </DialogActions>
            )}

            {/* Action buttons for Proctor */}
            {type === 'proctor' && selectedLeave.status === 'Pending' && (
              <DialogActions sx={{ p: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleProctorAction(selectedLeave._id, 'Rejected')}
                  startIcon={<Cancel />}
                  disabled={actionLoading}
                >
                  Reject
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleProctorAction(selectedLeave._id, 'Approved')}
                  startIcon={<CheckCircle />}
                  disabled={actionLoading}
                >
                  {actionLoading ? <CircularProgress size={20} /> : 'Approve'}
                </Button>
              </DialogActions>
            )}
          </>
        )}
      </Dialog>
    </Paper>
  );
};

LeaveList.propTypes = {
  type: PropTypes.string.isRequired,
};

export default LeaveList;
