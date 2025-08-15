import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, useMediaQuery, useTheme } from '@mui/material';

import Sidebar from './Sidebar';
import TopBar from './TopBar';

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      
      {/* Top Navigation Bar */}
      <TopBar 
        sidebarOpen={sidebarOpen} 
        onSidebarToggle={handleDrawerToggle} 
      />
      
      {/* Sidebar / Drawer */}
      <Sidebar 
        open={sidebarOpen} 
        onClose={handleDrawerToggle} 
        variant={isMobile ? 'temporary' : 'persistent'} 
      />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${sidebarOpen ? 240 : 0}px)` },
          mt: '64px', // Below the app bar
          backgroundColor: 'background.default',
          overflow: 'auto',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
