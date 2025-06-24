import Leave from '../models/Leave.js';
import User from '../models/User.js';
import Timetable from '../models/Timetable.js';

// Get available substitute teachers for a specific date and time slot
export const getAvailableSubstitutes = async (req, res) => {
  try {
    const { date, timeSlot, department } = req.query;
    
    console.log('Getting available substitutes for:', { date, timeSlot, department });
    
    if (!date || !timeSlot) {
      return res.status(400).json({ message: 'Date and timeSlot are required' });
    }

    // Parse date properly to avoid timezone issues
    const requestDate = new Date(date + 'T00:00:00.000Z');
    const dayName = requestDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      timeZone: 'UTC' 
    });
    
    console.log('Request date:', requestDate, 'Day name:', dayName);

    // Get all faculty in the same department (or all faculty if department not specified)
    const facultyQuery = { 
      role: 'Faculty',
      _id: { $ne: req.userId } // Exclude the requesting faculty
    };
    
    // Handle department matching - be more flexible with department names
    if (department && department !== 'undefined' && department !== 'null') {
      // Try exact match first, then partial match
      const deptRegex = new RegExp(department.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      facultyQuery.$or = [
        { department: department },
        { department: deptRegex },
        { department: 'CSE' }, // Add common department abbreviations
        { department: 'Computer Science' },
        { department: 'CS' }
      ];
    }

    const allFaculty = await User.find(facultyQuery).select('_id name email department');
    console.log('Found faculty:', allFaculty.length);
    console.log('Faculty details:', allFaculty.map(f => ({ name: f.name, dept: f.department })));

    const availableFaculty = [];

    for (const faculty of allFaculty) {
      console.log(`\nChecking faculty: ${faculty.name} (${faculty.department})`);
      
      // Check if faculty is on leave on that date
      const facultyOnLeave = await Leave.findOne({
        user: faculty._id,
        startDate: { $lte: requestDate },
        endDate: { $gte: requestDate },
        status: { $in: ['Approved', 'Pending_HOD', 'Pending_Substitution'] }
      });

      if (facultyOnLeave) {
        console.log(`❌ Faculty ${faculty.name} is on leave`);
        continue;
      }

      // Check if faculty has a class at that time slot on that day
      const hasClass = await Timetable.findOne({
        faculty: faculty._id,
        day: dayName,
        timeSlot: timeSlot
      });

      if (hasClass) {
        console.log(`❌ Faculty ${faculty.name} has a class (${hasClass.subject}) at ${timeSlot} on ${dayName}`);
        continue;
      }

      // Check if faculty is already assigned as substitute for that slot
      const alreadySubstitute = await Leave.findOne({
        'substitutions.date': requestDate,
        'substitutions.timeSlot': timeSlot,
        'substitutions.substituteTeacher': faculty._id,
        'substitutions.status': { $in: ['Pending', 'Accepted'] }
      });

      if (alreadySubstitute) {
        console.log(`❌ Faculty ${faculty.name} is already assigned as substitute`);
        continue;
      }

      console.log(`✅ Faculty ${faculty.name} is available`);
      availableFaculty.push({
        _id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        department: faculty.department
      });
    }

    console.log('Available faculty count:', availableFaculty.length);
    console.log('Available faculty:', availableFaculty.map(f => f.name));
    
    res.status(200).json({ availableFaculty });
  } catch (error) {
    console.error('Error getting available substitutes:', error);
    res.status(500).json({ 
      message: 'Server error while fetching available substitutes',
      error: error.message 
    });
  }
};

// Get faculty's timetable for specific date range
export const getFacultyTimetableForDates = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const facultyId = req.userId;

    console.log('Getting timetable for dates:', { startDate, endDate, facultyId });

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    // Parse dates properly to avoid timezone issues
    const start = new Date(startDate + 'T00:00:00.000Z');
    const end = new Date(endDate + 'T00:00:00.000Z');
    
    console.log('Parsed dates:', { start, end });

    // Check if faculty has uploaded timetable
    const timetableExists = await Timetable.findOne({ faculty: facultyId });
    if (!timetableExists) {
      return res.status(404).json({ 
        message: 'No timetable found. Please upload your timetable first.',
        affectedClasses: []
      });
    }
    
    const affectedClasses = [];
    
    // Get all days between start and end date
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dayName = currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        timeZone: 'UTC' 
      });
      
      // Skip weekends if needed (optional)
      if (dayName === 'Sunday') {
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        continue;
      }
      
      console.log('Checking day:', dayName, 'for date:', currentDate.toISOString().split('T')[0]);
      
      const dayClasses = await Timetable.find({
        faculty: facultyId,
        day: dayName
      }).sort({ timeSlot: 1 });

      console.log(`Found ${dayClasses.length} classes for ${dayName}`);

      dayClasses.forEach(classItem => {
        affectedClasses.push({
          date: new Date(currentDate), // Keep as Date object
          day: dayName,
          timeSlot: classItem.timeSlot,
          subject: classItem.subject,
          classroom: classItem.classroom
        });
      });

      // Move to next day
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    console.log('Total affected classes:', affectedClasses.length);
    res.status(200).json({ affectedClasses });
  } catch (error) {
    console.error('Error getting faculty timetable:', error);
    res.status(500).json({ 
      message: 'Server error while fetching timetable',
      error: error.message,
      affectedClasses: []
    });
  }
};

// Respond to substitution request
export const respondToSubstitution = async (req, res) => {
  try {
    const { leaveId, substitutionId, response, rejectionReason } = req.body;
    const facultyId = req.userId;

    if (!leaveId || !substitutionId || !response) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!['Accepted', 'Rejected'].includes(response)) {
      return res.status(400).json({ message: 'Invalid response. Must be Accepted or Rejected' });
    }

    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    const substitution = leave.substitutions.id(substitutionId);
    if (!substitution) {
      return res.status(404).json({ message: 'Substitution not found' });
    }

    if (substitution.substituteTeacher.toString() !== facultyId) {
      return res.status(403).json({ message: 'Not authorized to respond to this substitution' });
    }

    if (substitution.status !== 'Pending') {
      return res.status(400).json({ message: 'This substitution has already been responded to' });
    }

    substitution.status = response;
    substitution.responseDate = new Date();
    if (response === 'Rejected' && rejectionReason) {
      substitution.rejectionReason = rejectionReason;
    }

    // Check overall substitution status
    const allSubstitutions = leave.substitutions;
    const pendingCount = allSubstitutions.filter(sub => sub.status === 'Pending').length;
    const rejectedCount = allSubstitutions.filter(sub => sub.status === 'Rejected').length;
    const acceptedCount = allSubstitutions.filter(sub => sub.status === 'Accepted').length;

    if (rejectedCount > 0) {
      leave.substitutionStatus = 'Rejected';
      leave.status = 'Draft'; // Send back to applicant
    } else if (pendingCount === 0 && acceptedCount === allSubstitutions.length) {
      leave.substitutionStatus = 'Complete';
      leave.status = 'Pending_HOD'; // Forward to HOD
    } else if (acceptedCount > 0) {
      leave.substitutionStatus = 'Partial';
    }

    await leave.save();

    res.status(200).json({ 
      message: 'Response recorded successfully',
      substitutionStatus: leave.substitutionStatus,
      overallStatus: leave.status
    });
  } catch (error) {
    console.error('Error responding to substitution:', error);
    res.status(500).json({ message: 'Server error while responding to substitution' });
  }
};

// Get substitution requests for a faculty
export const getSubstitutionRequests = async (req, res) => {
  try {
    const facultyId = req.userId;

    const leaves = await Leave.find({
      'substitutions.substituteTeacher': facultyId,
      'substitutions.status': 'Pending'
    }).populate('user', 'name email department')
      .populate('substitutions.substituteTeacher', 'name email');

    const substitutionRequests = [];
    
    leaves.forEach(leave => {
      leave.substitutions.forEach(sub => {
        if (sub.substituteTeacher._id.toString() === facultyId && sub.status === 'Pending') {
          substitutionRequests.push({
            leaveId: leave._id,
            substitutionId: sub._id,
            applicant: leave.user,
            leaveReason: leave.reason,
            leaveType: leave.type,
            startDate: leave.startDate,
            endDate: leave.endDate,
            substitution: {
              date: sub.date,
              timeSlot: sub.timeSlot,
              subject: sub.subject,
              classroom: sub.classroom
            }
          });
        }
      });
    });

    res.status(200).json({ substitutionRequests });
  } catch (error) {
    console.error('Error getting substitution requests:', error);
    res.status(500).json({ message: 'Server error while fetching substitution requests' });
  }
};

// Helper function to get all faculty in department (for debugging)
export const getAllFacultyInDepartment = async (req, res) => {
  try {
    const { department } = req.query;
    
    const facultyQuery = { role: 'Faculty' };
    if (department) {
      facultyQuery.department = department;
    }
    
    const faculty = await User.find(facultyQuery).select('name email department');
    
    res.status(200).json({ 
      faculty,
      count: faculty.length,
      departments: [...new Set(faculty.map(f => f.department))]
    });
  } catch (error) {
    console.error('Error getting faculty:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
