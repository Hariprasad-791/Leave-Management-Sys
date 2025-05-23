import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Avatar, Menu, MenuItem, IconButton, Box } from '@mui/material';
import { AccountCircle, ExitToApp, Dashboard } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getRole, removeToken } from '../utils/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const role = getRole();
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const logout = () => {
    removeToken();
    navigate('/');
  };

  const getInitials = () => {
    // This would ideally come from the user's name in a real app
    return role.substring(0, 2).toUpperCase();
  };

  return (
    <AppBar position="sticky" elevation={3}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Leave Management System
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {role}
          </Typography>
          
          <IconButton
            size="large"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar sx={{ bgcolor: 'secondary.main', width: 35, height: 35 }}>
              {getInitials()}
            </Avatar>
          </IconButton>
          
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={() => { handleClose(); navigate(`/${role.toLowerCase()}`); }}>
              <Dashboard fontSize="small" sx={{ mr: 1 }} />
              Dashboard
            </MenuItem>
            <MenuItem onClick={logout}>
              <ExitToApp fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
