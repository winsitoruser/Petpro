import React from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
  Button,
  useTheme
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Person as PersonIcon,
  Pets as PetsIcon,
  EventNote as EventNoteIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  MedicalServices as MedicalServicesIcon,
} from '@mui/icons-material';

const Dashboard: React.FC = () => {
  const theme = useTheme();

  // Mock data for stats cards
  const stats = [
    { 
      title: 'Total Users', 
      value: '2,845', 
      change: '+12%', 
      trend: 'up', 
      icon: <PersonIcon sx={{ fontSize: 40 }} /> 
    },
    { 
      title: 'Active Clinics', 
      value: '52', 
      change: '+8%', 
      trend: 'up', 
      icon: <MedicalServicesIcon sx={{ fontSize: 40 }} /> 
    },
    { 
      title: 'Bookings (Today)', 
      value: '184', 
      change: '+24%', 
      trend: 'up', 
      icon: <EventNoteIcon sx={{ fontSize: 40 }} /> 
    },
    { 
      title: 'Total Pets', 
      value: '4,219', 
      change: '+18%', 
      trend: 'up', 
      icon: <PetsIcon sx={{ fontSize: 40 }} /> 
    },
    { 
      title: 'Product Sales', 
      value: '$12,485', 
      change: '-5%', 
      trend: 'down', 
      icon: <InventoryIcon sx={{ fontSize: 40 }} /> 
    },
    { 
      title: 'Orders (Today)', 
      value: '65', 
      change: '+10%', 
      trend: 'up', 
      icon: <ShoppingCartIcon sx={{ fontSize: 40 }} /> 
    },
  ];

  // Mock data for recent activities
  const recentActivities = [
    { 
      id: 1, 
      type: 'user_registration', 
      text: 'New user registered', 
      details: 'Emily Johnson (emily.j@example.com)', 
      time: '10 minutes ago' 
    },
    { 
      id: 2, 
      type: 'booking_created', 
      text: 'New booking created', 
      details: 'Checkup for "Max" at Happy Paws Clinic', 
      time: '25 minutes ago' 
    },
    { 
      id: 3, 
      type: 'order_placed', 
      text: 'New order placed', 
      details: 'Order #38492: Premium Dog Food (3 items)', 
      time: '45 minutes ago' 
    },
    { 
      id: 4, 
      type: 'clinic_registration', 
      text: 'New clinic registered', 
      details: 'PetCare Plus (Dr. Robert Wilson)', 
      time: '1 hour ago' 
    },
    { 
      id: 5, 
      type: 'booking_cancelled', 
      text: 'Booking cancelled', 
      details: 'Grooming for "Luna" at Furry Friends Salon', 
      time: '2 hours ago' 
    },
  ];

  // Mock data for recent users
  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Pet Owner', joinDate: '2025-08-14' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Clinic Admin', joinDate: '2025-08-13' },
    { id: 3, name: 'Robert Johnson', email: 'robert.j@example.com', role: 'Vet Doctor', joinDate: '2025-08-12' },
    { id: 4, name: 'Emily Davis', email: 'emily.d@example.com', role: 'Pet Owner', joinDate: '2025-08-11' },
  ];

  // Mock data for recent clinics
  const recentClinics = [
    { id: 1, name: 'Happy Paws Veterinary', location: 'New York, NY', status: 'Active', doctors: 5 },
    { id: 2, name: 'Healthy Pets Clinic', location: 'Los Angeles, CA', status: 'Active', doctors: 8 },
    { id: 3, name: 'Animal Wellness Center', location: 'Chicago, IL', status: 'Pending', doctors: 3 },
    { id: 4, name: 'Pet Care Specialists', location: 'Houston, TX', status: 'Active', doctors: 6 },
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Welcome to the PetPro Admin Dashboard. Here's an overview of your platform's performance.
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" component="div" fontWeight={600}>
                      {stat.value}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      {stat.title}
                    </Typography>
                  </Box>
                  <Avatar 
                    sx={{ 
                      bgcolor: theme.palette.primary.light,
                      p: 0.5
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {stat.trend === 'up' ? (
                    <TrendingUpIcon fontSize="small" color="success" />
                  ) : (
                    <TrendingDownIcon fontSize="small" color="error" />
                  )}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      ml: 1,
                      color: stat.trend === 'up' ? 'success.main' : 'error.main'
                    }}
                  >
                    {stat.change} from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Recent Activity */}
        <Grid item xs={12} md={6} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Recent Activity" 
              action={
                <Button size="small" color="primary">View All</Button>
              }
            />
            <Divider />
            <CardContent>
              <List>
                {recentActivities.map((activity) => (
                  <React.Fragment key={activity.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 
                          activity.type.includes('user') ? 'primary.light' :
                          activity.type.includes('booking') ? 'success.light' :
                          activity.type.includes('order') ? 'secondary.light' :
                          'info.light'
                        }}>
                          {activity.type.includes('user') ? <PersonIcon /> :
                           activity.type.includes('booking') ? <EventNoteIcon /> :
                           activity.type.includes('order') ? <ShoppingCartIcon /> :
                           <MedicalServicesIcon />
                          }
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.text}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {activity.details}
                            </Typography>
                            {" — "}
                            {activity.time}
                          </>
                        }
                      />
                    </ListItem>
                    {activity.id !== recentActivities.length && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Users */}
        <Grid item xs={12} md={6} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Recent Users" 
              action={
                <Button size="small" color="primary">View All</Button>
              }
            />
            <Divider />
            <CardContent>
              <List>
                {recentUsers.map((user) => (
                  <React.Fragment key={user.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar>{user.name.charAt(0)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.name}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {user.email}
                            </Typography>
                            <Box sx={{ display: 'flex', mt: 0.5, justifyContent: 'space-between' }}>
                              <Chip 
                                label={user.role} 
                                size="small" 
                                sx={{ 
                                  fontSize: '0.75rem',
                                  bgcolor: user.role === 'Pet Owner' ? 'info.light' : 
                                           user.role === 'Clinic Admin' ? 'warning.light' : 'success.light',
                                  color: 'white'
                                }} 
                              />
                              <Typography variant="caption">
                                Joined: {user.joinDate}
                              </Typography>
                            </Box>
                          </>
                        }
                      />
                    </ListItem>
                    {user.id !== recentUsers.length && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Clinics */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Recent Clinics" 
              action={
                <Button size="small" color="primary">View All</Button>
              }
            />
            <Divider />
            <Box sx={{ overflow: 'auto' }}>
              <Box sx={{ width: '100%', display: 'table', tableLayout: 'fixed' }}>
                <Box sx={{ display: 'table-header-group', bgcolor: 'background.default' }}>
                  <Box sx={{ display: 'table-row' }}>
                    {['Clinic Name', 'Location', 'Status', 'Doctors', 'Actions'].map((header) => (
                      <Box 
                        key={header} 
                        sx={{ 
                          display: 'table-cell', 
                          p: 2, 
                          fontWeight: 'bold',
                          borderBottom: 1, 
                          borderColor: 'divider' 
                        }}
                      >
                        {header}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box sx={{ display: 'table-row-group' }}>
                  {recentClinics.map((clinic) => (
                    <Box key={clinic.id} sx={{ display: 'table-row' }}>
                      <Box sx={{ display: 'table-cell', p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        {clinic.name}
                      </Box>
                      <Box sx={{ display: 'table-cell', p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        {clinic.location}
                      </Box>
                      <Box sx={{ display: 'table-cell', p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        <Chip
                          label={clinic.status}
                          size="small"
                          sx={{
                            bgcolor: clinic.status === 'Active' ? 'success.light' : 'warning.light',
                            color: 'white'
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'table-cell', p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        {clinic.doctors}
                      </Box>
                      <Box sx={{ display: 'table-cell', p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        <Button size="small" variant="outlined">View Details</Button>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
