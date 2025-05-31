import Leave from '../models/Leave.js';
import User from '../models/User.js';


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
      student: user._id,
      title,
      description,
      fromDate,
      toDate,
      documentUrl: req.file?.path || null,
      isFacultyLeave: user.role === 'Faculty',
      proctor: user.role === 'Student'
        ? (user.substituteProctor || user.proctor)
        : null,
      department: user.department,
    });

    await leave.save();
    return res.status(201).json({ message: 'Leave submitted successfully' });
  } catch (error) {
    console.error('Error submitting leave:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


// Helper: Update leave status based on approvals
const updateLeaveStatus = (leave, approvalStatus) => {
  if (approvalStatus === 'Rejected') {
    leave.status = 'Rejected';
    return;
  }

  if (leave.isFacultyLeave && leave.hodApproval) {
    leave.status = 'Approved';
  } else if (leave.proctorApproval && leave.hodApproval) {
    leave.status = 'Approved';
  } else {
    leave.status = 'Pending';
  }
};

// Helper: Assign substitute proctor to faculty and their students
const assignSubstituteProctor = async (leave, substituteProctorId) => {
  if (!substituteProctorId) {
    throw new Error('Substitute proctor is required for faculty leave');
  }

  leave.substituteProctor = substituteProctorId;

  const facultyUser = await User.findById(leave.student);
  if (facultyUser && facultyUser.role === 'Faculty') {
    facultyUser.substituteProctor = substituteProctorId;
    await facultyUser.save();

    const students = await User.find({ proctor: facultyUser._id });
    for (const student of students) {
      student.substituteProctor = substituteProctorId;
      await student.save();
    }
  }
};

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
      leave.proctorApproval = approvalStatus === 'Approved';
      leave.comments = comments || '';
    } else if (user.role === 'HOD') {
      // HOD approval for student leaves requires prior proctor approval
      if (!leave.isFacultyLeave && !leave.proctorApproval) {
        return res.status(400).json({ message: 'Proctor must approve the leave first.' });
      }

      leave.hodApproval = approvalStatus === 'Approved';
      leave.comments = comments || '';
      leave.rejectionReason = rejectionReason || '';

      if (leave.isFacultyLeave && leave.hodApproval) {
        try {
          await assignSubstituteProctor(leave, substituteProctorId);
        } catch (error) {
          return res.status(400).json({ message: error.message });
        }
      }
    } else {
      return res.status(403).json({ message: 'Unauthorized role' });
    }

    updateLeaveStatus(leave, approvalStatus);

    await leave.save();

    res.status(200).json({ message: `Leave ${approvalStatus}` });
  } catch (err) {
    console.error('Error approving leave:', err);
    res.status(500).json({ message: 'Server error while approving leave' });
  }
};

// BACKEND: Revert Temporary Proctor (run on schedule or admin route)


export const revertSubstituteProctors = async () => {
  const today = new Date();

  const expiredLeaves = await Leave.find({
    isFacultyLeave: true,
    toDate: { $lt: today },
    substituteProctor: { $exists: true },
  });

  for (const leave of expiredLeaves) {
    // Find students who were temporarily assigned this substitute
    const affectedStudents = await User.find({
      substituteProctor: leave.substituteProctor,
      proctor: leave.proctor,
      department: leave.department,
    });

    for (const student of affectedStudents) {
      student.substituteProctor = undefined; // Remove temporary assignment
      await student.save();
    }

    // Clear from leave record as well
    leave.substituteProctor = undefined;
    await leave.save();
  }

  console.log(`Reverted substitute proctors for ${expiredLeaves.length} expired leave(s).`);
};

// Get Leave Status (Student)
export const getLeaveStatus = async (req, res) => {
  const studentId = req.userId;

  try {
    // Retrieve all leave requests for the logged-in student
    const leaveRequests = await Leave.find({ student: studentId });

    return res.status(200).json(leaveRequests);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error retrieving leave status', error });
  }
};

// Get All Leave Requests (Admin)
export const getAllLeaveRequests = async (req, res) => {
  try {
    // Retrieve all leave requests (for Admin to manage)
    const leaveRequests = await Leave.find().populate('student proctor'); // Populate student and proctor details

    return res.status(200).json(leaveRequests);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error retrieving all leave requests', error });
  }
};

// Get Leave Details by ID (Admin/Faculty/HOD)
export const getLeaveRequestById = async (req, res) => {
  const { leaveId } = req.params;

  try {
    // Find leave request by ID
    const leave = await Leave.findById(leaveId).populate('student proctor'); // Populate student and proctor details

    if (!leave) {
      return res.status(400).json({ message: 'Leave request not found' });
    }

    return res.status(200).json(leave);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error retrieving leave request details', error });
  }
};

// Reject Leave Request (Faculty/HOD) - This is handled by approveLeaveRequest itself
// But here, you could implement it separately if needed
export const rejectLeaveRequest = async (req, res) => {
  const { leaveId } = req.body;

  try {
    // Find leave request by ID
    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(400).json({ message: 'Leave request not found' });
    }

    leave.status = 'Rejected'; // Mark as Rejected directly

    // Save the updated leave request
    await leave.save();

    return res.status(200).json({ message: 'Leave request rejected' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error rejecting leave request', error });
  }
};


// controllers/leaveController.js
// Update the getLeaveByFaculty function
export const getLeaveByFaculty = async (req, res) => {
  try {
    const proctorId = req.userId;
    const leaves = await Leave.find({
      $or: [
        { proctor: proctorId },
        { substituteProctor: proctorId },
      ]
    }).populate({
      path: 'student',
      select: 'name email role department'
    });
    res.status(200).json(leaves);
  } catch (err) {
    console.error('Error fetching faculty leaves:', err);
    res.status(500).json({ message: 'Server error while retrieving leaves' });
  }
};

// Update the getLeavesByDepartment function
export const getLeavesByDepartment = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'HOD') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const leaves = await Leave.find({
      department: user.department,
      $or: [
        {
          proctorApproval: true,
        },
        {
          isFacultyLeave: true,
        }
      ],
    }).populate({
      path: 'student',
      select: 'name email role department'
    });

    res.json(leaves);
  } catch (err) {
    console.error('Error fetching department leaves:', err);
    res.status(500).json({ message: 'Server error while retrieving leaves' });
  }
};



export const getLeavesByStudent = async (req, res) => {
  const studentId = req.params.studentId;
  const leaves = await Leave.find({ student: studentId });
  res.json(leaves);
};
