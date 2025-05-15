import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['Student', 'Faculty', 'HOD'], required: true },
  department: String,
  proctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  substituteProctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ✅ New
  isInLeave: { type: Boolean, default: false }
});


const User = mongoose.model('User', userSchema);

export default User;
