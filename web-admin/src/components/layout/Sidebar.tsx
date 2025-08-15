import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  EventNote as BookingsIcon,
  Inventory as ProductsIcon,
  ShoppingCart as OrdersIcon,
  BarChart as ReportsIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import PetsIcon from '@mui/icons-material/Pets';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant: 'permanent' | 'persistent' | 'temporary';
}

const DRAWER_WIDTH = 240;

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Users', icon: <PeopleIcon />, path: '/users' },
  { label: 'Clinics', icon: <BusinessIcon />, path: '/clinics' },
  { label: 'Bookings', icon: <BookingsIcon />, path: '/bookings' },
  { label: 'Products', icon: <ProductsIcon />, path: '/products' },
  { label: 'Orders', icon: <OrdersIcon />, path: '/orders' },
  { label: 'Reports', icon: <ReportsIcon />, path: '/reports' },
];

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, variant }) => {
  const location = useLocation();
  const theme = useTheme();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const content = (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: theme.spacing(2),
          paddingLeft: theme.spacing(3),
        }}
      >
        <PetsIcon sx={{ color: 'primary.main', mr: 1 }} />
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontWeight: 700 }}
        >
          PetPro Admin
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ py: 2 }}>
        <List>
          {navItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={isActive(item.path)}
                sx={{
                  py: 1,
                  minHeight: 48,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive(item.path) ? 'white' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider />

      <List>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/settings"
            selected={isActive('/settings')}
            sx={{
              py: 1,
              minHeight: 48,
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.main',
                },
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: isActive('/settings') ? 'white' : 'inherit',
              }}
            >
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/help"
            selected={isActive('/help')}
            sx={{
              py: 1,
              minHeight: 48,
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <HelpIcon />
            </ListItemIcon>
            <ListItemText primary="Help & Support" />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better performance on mobile
      }}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      {content}
    </Drawer>
  );
};

export default Sidebar;
