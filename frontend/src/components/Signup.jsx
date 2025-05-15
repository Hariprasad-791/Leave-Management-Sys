import React, { useState } from 'react';
import API from '../utils/api';

function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student',
    department: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/signup', form);
      alert('User created successfully!');
      setForm({
        name: '',
        email: '',
        password: '',
        role: 'Student',
        department: '',
      });
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Error occurred while creating user.';
      setError(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Admin: Create User</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <input
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
        required
      />
      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
      />
      <input
        name="password"
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={handleChange}
        required
      />

      <select name="role" value={form.role} onChange={handleChange}>
        <option value="Student">Student</option>
        <option value="Faculty">Faculty</option>
        <option value="HOD">HOD</option>
      </select>

      <select
        name="department"
        value={form.department}
        onChange={handleChange}
        required
      >
        <option value="">Select Department</option>
        <option value="CSE">CSE</option>
        <option value="ISE">ISE</option>
        <option value="ECE">ECE</option>
      </select>

      <button type="submit">Create</button>
    </form>
  );
}

export default Signup;
