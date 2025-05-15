import React, { useState } from 'react';
import API from '../utils/api';

function LeaveForm() {
  const [form, setForm] = useState({
    title: '', description: '', fromDate: '', toDate: '', document: null
  });

  const handleChange = (e) => {
    if (e.target.name === 'document') {
      setForm({ ...form, document: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([key, val]) => fd.append(key, val));
    await API.post('/leave/submit', fd);
    alert('Leave submitted');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Apply Leave</h2>
      <input name="title" onChange={handleChange} placeholder="Title" />
      <input name="description" onChange={handleChange} placeholder="Description" />
      <input name="fromDate" type="date" onChange={handleChange} />
      <input name="toDate" type="date" onChange={handleChange} />
      <input name="document" type="file" onChange={handleChange} />
      <button type="submit">Submit</button>
    </form>
  );
}

export default LeaveForm;
