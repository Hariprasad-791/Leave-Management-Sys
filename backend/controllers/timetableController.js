import Timetable from '../models/Timetable.js';
import User from '../models/User.js';
import XLSX from 'xlsx';

export const uploadTimetable = async (req, res) => {
  try {
    const facultyId = req.userId;
    const faculty = await User.findById(facultyId);
    
    if (!faculty || faculty.role !== 'Faculty') {
      return res.status(403).json({ message: 'Only faculty can upload timetables' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an Excel file' });
    }

    // Read the Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Validate and process the data
    const timetableEntries = [];
    const errors = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 2; // Excel row number (accounting for header)

      // Validate required fields
      if (!row.Day || !row.TimeSlot || !row.Subject || !row.Classroom) {
        errors.push(`Row ${rowNumber}: Missing required fields (Day, TimeSlot, Subject, Classroom)`);
        continue;
      }

      // Validate day
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      if (!validDays.includes(row.Day)) {
        errors.push(`Row ${rowNumber}: Invalid day "${row.Day}". Must be one of: ${validDays.join(', ')}`);
        continue;
      }

      timetableEntries.push({
        faculty: facultyId,
        day: row.Day,
        timeSlot: row.TimeSlot.toString().trim(),
        subject: row.Subject.toString().trim(),
        classroom: row.Classroom.toString().trim(),
        department: faculty.department
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({ 
        message: 'Validation errors found in Excel file', 
        errors 
      });
    }

    if (timetableEntries.length === 0) {
      return res.status(400).json({ message: 'No valid timetable entries found' });
    }

    // Delete existing timetable for this faculty
    await Timetable.deleteMany({ faculty: facultyId });

    // Insert new timetable entries
    await Timetable.insertMany(timetableEntries);

    res.status(200).json({ 
      message: 'Timetable uploaded successfully', 
      entriesCount: timetableEntries.length 
    });

  } catch (error) {
    console.error('Error uploading timetable:', error);
    res.status(500).json({ message: 'Server error while uploading timetable' });
  }
};

export const getTimetable = async (req, res) => {
  try {
    const facultyId = req.userId;
    
    const timetable = await Timetable.find({ faculty: facultyId })
      .sort({ day: 1, timeSlot: 1 });

    // Group by day for better display
    const groupedTimetable = timetable.reduce((acc, entry) => {
      if (!acc[entry.day]) {
        acc[entry.day] = [];
      }
      acc[entry.day].push({
        timeSlot: entry.timeSlot,
        subject: entry.subject,
        classroom: entry.classroom
      });
      return acc;
    }, {});

    res.status(200).json({
      timetable: groupedTimetable,
      totalEntries: timetable.length
    });

  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ message: 'Server error while fetching timetable' });
  }
};
