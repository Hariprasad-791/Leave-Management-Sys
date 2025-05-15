import mongoose from 'mongoose';

// Define the Leave Schema
const leaveSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  description: String,
  fromDate: Date,
  toDate: Date,
  documentUrl: String,
  proctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  department: String,
  isFacultyLeave: { type: Boolean, default: false },
  proctorApproval: { type: Boolean },
  hodApproval: { type: Boolean },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  comments: String,
  rejectionReason: String,
  substituteProctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

// Pre-save hook to set the department from the student's User model
leaveSchema.pre('save', async function (next) {
  try {
    // If this leave has a student, find the student's department
    if (this.student) {
      const student = await mongoose.model('User').findById(this.student);
      this.department = student.department; // Set the department field in the leave
    }
    next(); // Proceed with saving the leave document
  } catch (error) {
    next(error); // Pass errors to the next middleware
  }
});

// Create the Leave model
const Leave = mongoose.model('Leave', leaveSchema);

export default Leave;
