import mongoose from 'mongoose';

const substitutionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  subject: { type: String, required: true },
  classroom: { type: String, required: true },
  substituteTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'Rejected'], 
    default: 'Pending' 
  },
  responseDate: { type: Date },
  rejectionReason: { type: String }
});

const leaveSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  type: { type: String, required: true },
  document: { type: String },
  status: { 
    type: String, 
    enum: ['Draft', 'Pending_Substitution', 'Pending_HOD', 'Approved', 'Rejected'], 
    default: 'Draft' 
  },
  substitutions: [substitutionSchema],
  substitutionStatus: {
    type: String,
    enum: ['Not_Required', 'Pending', 'Partial', 'Complete', 'Rejected'],
    default: 'Not_Required'
  },
  proctorApproval: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  hodApproval: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  appliedDate: { type: Date, default: Date.now },
  proctorComments: { type: String },
  hodComments: { type: String },
  rejectionReason: { type: String }
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

const Leave = mongoose.model('Leave', leaveSchema);
export default Leave;

