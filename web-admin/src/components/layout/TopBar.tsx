import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

interface TopBarProps {
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ sidebarOpen, onSidebarToggle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState<null | HTMLElement>(null);
  
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenNotifications = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setAnchorElNotifications(null);
  };

  const handleLogout = () => {
    // In a real app, this would handle the logout functionality
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleCloseUserMenu();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onSidebarToggle}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Admin Portal
        </Typography>

        {/* Search icon */}
        <IconButton color="inherit" sx={{ mr: 1 }}>
          <SearchIcon />
        </IconButton>

        {/* Notifications */}
        <Box sx={{ flexGrow: 0, mr: 2 }}>
          <Tooltip title="Show notifications">
            <IconButton 
              color="inherit"
              onClick={handleOpenNotifications}
              aria-controls={Boolean(anchorElNotifications) ? 'notifications-menu' : undefined}
              aria-haspopup="true"
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ mt: '45px' }}
            id="notifications-menu"
            anchorEl={anchorElNotifications}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElNotifications)}
            onClose={handleCloseNotifications}
          >
            <Box sx={{ p: 2, width: 320 }}>
              <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                Notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                New booking request from John Doe
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                5 minutes ago
              </Typography>
              <Box sx={{ height: 1, bgcolor: 'divider', my: 1.5 }} />
              <Typography variant="body2" color="text.secondary">
                New clinic registration: Happy Paws Vet Clinic
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                25 minutes ago
              </Typography>
              <Box sx={{ height: 1, bgcolor: 'divider', my: 1.5 }} />
              <Typography variant="body2" color="text.secondary">
                Order #1234 has been shipped
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                1 hour ago
              </Typography>
            </Box>
          </Menu>
        </Box>

        {/* User menu */}
        <Box sx={{ flexGrow: 0 }}>
          <Tooltip title="Open settings">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar alt="Admin User">
                <PersonIcon />
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ mt: '45px' }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2">Admin User</Typography>
              <Typography variant="body2" color="text.secondary">admin@petpro.com</Typography>
            </Box>
            <MenuItem onClick={() => handleNavigate('/profile')}>
              <PersonIcon sx={{ mr: 2, fontSize: 20 }} />
              <Typography>Profile</Typography>
            </MenuItem>
            <MenuItem onClick={() => handleNavigate('/settings')}>
              <SettingsIcon sx={{ mr: 2, fontSize: 20 }} />
              <Typography>Settings</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
              <Typography>Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
