import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';
import Login from './components/Login';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import HodDashboard from './pages/HodDashboard';
import ProtectedRoute from './ProtectedRoute';

// Create theme with customizations
let theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
          },
        },
      },
    },
  },
});

// Make fonts responsive
theme = responsiveFontSizes(theme);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/student" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
          <Route path="/faculty" element={<ProtectedRoute><FacultyDashboard /></ProtectedRoute>} />
          <Route path="/hod" element={<ProtectedRoute><HodDashboard /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
