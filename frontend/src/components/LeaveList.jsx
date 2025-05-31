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
  const [faculties, setFaculties] = useState([]);
  const [comments, setComments] = useState({});
  const [subs, setSubs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => {
    fetchLeaves();
  }, [type]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLeaves();
    setRefreshing(false);
  };

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
        setError('Please select a substitute proctor for faculty leave');
        return;
      }

      await API.post('/leave/approve', payload);

      // Refresh the leave list instead of full page reload
      const updatedLeaves = leaves.map(leave => {
        if (leave._id === leaveId) {
          return { ...leave, status: action };
        }
        return leave;
      });
      setLeaves(updatedLeaves);
      setOpenDialog(false);

    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
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
                  <TableCell><Typography variant="subtitle2">Title</Typography></TableCell>
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
                      <TableCell>{leave.title}</TableCell>
                      <TableCell>{new Date(leave.fromDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(leave.toDate).toLocaleDateString()}</TableCell>
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
              <Typography variant="h6">{selectedLeave.title}</Typography>
              <IconButton onClick={() => setOpenDialog(false)}>
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Requester</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedLeave.student?.name || 'N/A'} ({selectedLeave.student?.role || 'N/A'})
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedLeave.student?.email || 'N/A'}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">Department</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedLeave.department || 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">From Date</Typography>
                  <Typography variant="body1" gutterBottom>
                    {new Date(selectedLeave.fromDate).toLocaleDateString()}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">To Date</Typography>
                  <Typography variant="body1" gutterBottom>
                    {new Date(selectedLeave.toDate).toLocaleDateString()}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Typography variant="body1" gutterBottom>
                    {getStatusChip(selectedLeave.status)}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body1" component="p">
                    {selectedLeave.description || 'No description provided.'}
                  </Typography>
                </Grid>

                {selectedLeave.documentUrl && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Supporting Document</Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Assignment />}
                      size="small"
                      onClick={() => window.open(selectedLeave.documentUrl, '_blank', 'noopener, noreferrer')}
                      sx={{ mt: 1 }}
                    >
                      View Document
                    </Button>
                  </Grid>
                )}

                {selectedLeave.comments && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Comments</Typography>
                    <Typography variant="body1">
                      {selectedLeave.comments}
                    </Typography>
                  </Grid>
                )}

                {(type === 'proctor' || type === 'hod') && selectedLeave.status === 'Pending' && (
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
                        onChange={(e) => setComments({ ...comments, [selectedLeave._id]: e.target.value })}
                      />

                      {type === 'hod' && selectedLeave.isFacultyLeave && (
                        <FormControl fullWidth sx={{ mt: 2 }}>
                          <InputLabel>Select Substitute Proctor</InputLabel>
                          <Select
                            value={subs[selectedLeave._id] || ''}
                            onChange={(e) => setSubs({ ...subs, [selectedLeave._id]: e.target.value })}
                            label="Select Substitute Proctor"
                          >
                            <MenuItem value="">
                              <em>Select a faculty</em>
                            </MenuItem>
                            {faculties.map(fac => (
                              <MenuItem key={fac._id} value={fac._id}>
                                {fac.name} - {fac.email}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>

            {(type === 'proctor' || type === 'hod') && selectedLeave.status === 'Pending' && (
              <DialogActions sx={{ p: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleAction(selectedLeave._id, 'Rejected')}
                  startIcon={<Cancel />}
                >
                  Reject
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleAction(selectedLeave._id, 'Approved')}
                  startIcon={<CheckCircle />}
                >
                  Approve
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
  type: PropTypes.string.isRequired, // or PropTypes.oneOf([...]) if you know the valid types
};
export default LeaveList;
