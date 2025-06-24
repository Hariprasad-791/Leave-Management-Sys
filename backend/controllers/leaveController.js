import Leave from '../models/Leave.js';
import User from '../models/User.js';
import Timetable from '../models/Timetable.js';

// Legacy function - for backward compatibility
export const submitLeaveRequest = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const { title, description, fromDate, toDate } = req.body;

    // Check if Student and proctor is missing
    if (user.role === 'Student' && !user.proctor) {
      return res
        .status(400)
        .json({ message: 'You must be assigned a proctor to submit a leave' });
    }

    const leave = new Leave({
      user: user._id, // Updated field name
      startDate: fromDate, // Updated field name
      endDate: toDate, // Updated field name
      reason: description, // Updated field name
      type: title, // Updated field name
      document: req.file?.path || null,
      status: user.role === 'Faculty' ? 'Draft' : 'Pending_HOD',
      substitutions: [],
      substitutionStatus: 'Not_Required'
    });

    await leave.save();
    return res.status(201).json({ message: 'Leave submitted successfully' });
  } catch (error) {
    console.error('Error submitting leave:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// New function - Apply for leave with substitutions
export const applyLeave = async (req, res) => {
  try {
    const { startDate, endDate, reason, type, substitutions } = req.body;
    const userId = req.userId;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }

    if (end < start) {
      return res.status(400).json({ message: 'End date cannot be before start date' });
    }

    // Check for overlapping leaves
    const overlappingLeave = await Leave.findOne({
      user: userId,
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ],
      status: { $nin: ['Rejected'] }
    });

    if (overlappingLeave) {
      return res.status(400).json({ message: 'You already have a leave application for overlapping dates' });
    }

    // Parse substitutions if it's a string
    let parsedSubstitutions = [];
    if (substitutions) {
      try {
        parsedSubstitutions = typeof substitutions === 'string' 
          ? JSON.parse(substitutions) 
          : substitutions;
      } catch (error) {
        return res.status(400).json({ message: 'Invalid substitutions format' });
      }
    }

    // Create leave application
    const leave = new Leave({
      user: userId,
      startDate: start,
      endDate: end,
      reason,
      type,
      document: req.file?.path,
      substitutions: parsedSubstitutions || [],
      substitutionStatus: parsedSubstitutions && parsedSubstitutions.length > 0 ? 'Pending' : 'Not_Required',
      status: parsedSubstitutions && parsedSubstitutions.length > 0 ? 'Pending_Substitution' : 'Pending_HOD'
    });

    await leave.save();
    await leave.populate('user', 'name email department');
    await leave.populate('substitutions.substituteTeacher', 'name email');

    res.status(201).json({ 
      message: 'Leave application submitted successfully', 
      leave 
    });
  } catch (error) {
    console.error('Error applying for leave:', error);
    res.status(500).json({ message: 'Server error while applying for leave' });
  }
};

// Update leave with new substitutions
export const updateLeaveSubstitutions = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { substitutions } = req.body;
    const userId = req.userId;

    const leave = await Leave.findOne({ _id: leaveId, user: userId });
    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    if (leave.status !== 'Draft') {
      return res.status(400).json({ message: 'Cannot update substitutions for this leave application' });
    }

    // Reset substitutions
    leave.substitutions = substitutions;
    leave.substitutionStatus = 'Pending';
    leave.status = 'Pending_Substitution';

    await leave.save();
    await leave.populate('substitutions.substituteTeacher', 'name email');

    res.status(200).json({ 
      message: 'Substitutions updated successfully', 
      leave 
    });
  } catch (error) {
    console.error('Error updating substitutions:', error);
    res.status(500).json({ message: 'Server error while updating substitutions' });
  }
};

// Legacy approval function - for backward compatibility
export const approveLeaveRequest = async (req, res) => {
  try {
    const {
      leaveId,
      approvalStatus,
      comments,
      rejectionReason,
      substituteProctorId
    } = req.body;

    const user = await User.findById(req.userId);
    const leave = await Leave.findById(leaveId);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });

    if (user.role === 'Faculty') {
      // Faculty (Proctor) approval
      leave.proctorApproval = approvalStatus === 'Approved' ? 'Approved' : 'Rejected';
      leave.proctorComments = comments || '';
    } else if (user.role === 'HOD') {
      // HOD approval
      leave.hodApproval = approvalStatus === 'Approved' ? 'Approved' : 'Rejected';
      leave.hodComments = comments || '';
      leave.status = approvalStatus === 'Approved' ? 'Approved' : 'Rejected';

      if (approvalStatus === 'Rejected') {
        leave.rejectionReason = rejectionReason || comments || '';
      }
    } else {
      return res.status(403).json({ message: 'Unauthorized role' });
    }

    await leave.save();
    res.status(200).json({ message: `Leave ${approvalStatus}` });
  } catch (err) {
    console.error('Error approving leave:', err);
    res.status(500).json({ message: 'Server error while approving leave' });
  }
};

// HOD approve/reject leave (New system)
export const hodApproveReject = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { action, comments } = req.body;

    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    if (leave.status !== 'Pending_HOD') {
      return res.status(400).json({ message: 'Leave is not pending HOD approval' });
    }

    leave.hodApproval = action;
    leave.hodComments = comments;
    leave.status = action === 'Approved' ? 'Approved' : 'Rejected';

    if (action === 'Rejected') {
      leave.rejectionReason = comments;
    }

    await leave.save();

    res.status(200).json({ 
      message: `Leave ${action.toLowerCase()} successfully`, 
      leave 
    });
  } catch (error) {
    console.error('Error in HOD approval:', error);
    res.status(500).json({ message: 'Server error while processing HOD approval' });
  }
};

// Get leave status for current user
export const getLeaveStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const leaves = await Leave.find({ user: userId })
      .populate('substitutions.substituteTeacher', 'name email')
      .sort({ appliedDate: -1 });

    res.status(200).json(leaves);
  } catch (error) {
    console.error('Error fetching leave status:', error);
    res.status(500).json({ message: 'Server error while fetching leave status' });
  }
};

// Get leaves by specific student (for admin/proctor use)
export const getLeavesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const currentUser = await User.findById(req.userId);
    
    // Check authorization
    if (currentUser.role === 'Student' && currentUser._id.toString() !== studentId) {
      return res.status(403).json({ message: 'Unauthorized to view other student leaves' });
    }

    const leaves = await Leave.find({ user: studentId })
      .populate('user', 'name email department')
      .populate('substitutions.substituteTeacher', 'name email')
      .sort({ appliedDate: -1 });

    res.status(200).json(leaves);
  } catch (error) {
    console.error('Error fetching student leaves:', error);
    res.status(500).json({ message: 'Server error while fetching student leaves' });
  }
};

// Get leaves for faculty (as proctor) - Legacy function
export const getLeaveByFaculty = async (req, res) => {
  try {
    const proctorId = req.userId;
    
    // Find students under this proctor
    const students = await User.find({ 
      $or: [
        { proctor: proctorId },
        { substituteProctor: proctorId }
      ]
    });

    const studentIds = students.map(student => student._id);
    
    const leaves = await Leave.find({
      user: { $in: studentIds }
    }).populate('user', 'name email role department')
      .sort({ appliedDate: -1 });

    res.status(200).json(leaves);
  } catch (err) {
    console.error('Error fetching faculty leaves:', err);
    res.status(500).json({ message: 'Server error while retrieving leaves' });
  }
};

// Get leaves for faculty (as proctor) - New system
export const getLeavesByProctor = async (req, res) => {
  try {
    const proctorId = req.userId;
    
    // Find students under this proctor
    const students = await User.find({ 
      $or: [
        { proctor: proctorId },
        { substituteProctor: proctorId }
      ]
    });

    const studentIds = students.map(student => student._id);
    
    const leaves = await Leave.find({
      user: { $in: studentIds },
      status: { $in: ['Pending_HOD', 'Approved', 'Rejected'] }
    }).populate('user', 'name email role department')
      .populate('substitutions.substituteTeacher', 'name email')
      .sort({ appliedDate: -1 });

    res.status(200).json(leaves);
  } catch (err) {
    console.error('Error fetching proctor leaves:', err);
    res.status(500).json({ message: 'Server error while retrieving leaves' });
  }
};

// Get leaves for HOD approval
export const getLeavesForHOD = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (user.role !== 'HOD') {
      return res.status(403).json({ message: 'Only HOD can access this endpoint' });
    }

    // Get leaves from same department that are pending HOD approval
    const departmentUsers = await User.find({ department: user.department });
    const departmentUserIds = departmentUsers.map(u => u._id);

    const leaves = await Leave.find({
      user: { $in: departmentUserIds },
      status: 'Pending_HOD'
    }).populate('user', 'name email department role')
      .populate('substitutions.substituteTeacher', 'name email')
      .sort({ appliedDate: 1 });

    res.status(200).json(leaves);
  } catch (error) {
    console.error('Error fetching leaves for HOD:', error);
    res.status(500).json({ message: 'Server error while fetching leaves for HOD' });
  }
};

// Get leaves by department - Legacy function
export const getLeavesByDepartment = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'HOD') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Get all users in the department
    const departmentUsers = await User.find({ department: user.department });
    const departmentUserIds = departmentUsers.map(u => u._id);

    const leaves = await Leave.find({
      user: { $in: departmentUserIds }
    }).populate('user', 'name email role department')
      .populate('substitutions.substituteTeacher', 'name email')
      .sort({ appliedDate: -1 });

    res.json(leaves);
  } catch (err) {
    console.error('Error fetching department leaves:', err);
    res.status(500).json({ message: 'Server error while retrieving leaves' });
  }
};

// Get specific leave by ID
export const getLeaveById = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const currentUser = await User.findById(req.userId);

    const leave = await Leave.findById(leaveId)
      .populate('user', 'name email department role')
      .populate('substitutions.substituteTeacher', 'name email');

    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    // Check authorization
    const isOwner = leave.user._id.toString() === req.userId;
    const isProctor = currentUser.role === 'Faculty' && (
      await User.findOne({ 
        _id: leave.user._id, 
        $or: [{ proctor: req.userId }, { substituteProctor: req.userId }] 
      })
    );
    const isHOD = currentUser.role === 'HOD' && currentUser.department === leave.user.department;
    const isAdmin = currentUser.role === 'Admin';

    if (!isOwner && !isProctor && !isHOD && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized to view this leave' });
    }

    res.status(200).json(leave);
  } catch (error) {
    console.error('Error fetching leave by ID:', error);
    res.status(500).json({ message: 'Server error while fetching leave details' });
  }
};

// Legacy functions for backward compatibility
export const getAllLeaveRequests = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('user', 'name email department role')
      .populate('substitutions.substituteTeacher', 'name email')
      .sort({ appliedDate: -1 });

    res.status(200).json(leaves);
  } catch (error) {
    console.error('Error fetching all leaves:', error);
    res.status(500).json({ message: 'Server error while fetching all leaves' });
  }
};

export const getLeaveRequestById = async (req, res) => {
  return getLeaveById(req, res); // Use the new function
};

export const rejectLeaveRequest = async (req, res) => {
  try {
    const { leaveId } = req.body;

    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(400).json({ message: 'Leave request not found' });
    }

    leave.status = 'Rejected';
    await leave.save();

    return res.status(200).json({ message: 'Leave request rejected' });
  } catch (error) {
    console.error('Error rejecting leave:', error);
    return res.status(500).json({ message: 'Error rejecting leave request' });
  }
};

// Helper function for reverting substitute proctors (can be called via cron job)
export const revertSubstituteProctors = async () => {
  try {
    const today = new Date();

    const expiredLeaves = await Leave.find({
      endDate: { $lt: today },
      status: 'Approved',
      'substitutions.0': { $exists: true }
    });

    for (const leave of expiredLeaves) {
      // Clear substitute assignments if needed
      // This depends on your business logic
      console.log(`Processing expired leave: ${leave._id}`);
    }

    console.log(`Processed ${expiredLeaves.length} expired leave(s).`);
  } catch (error) {
    console.error('Error reverting substitute proctors:', error);
  }
};
