import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Pets as PetsIcon,
  CalendarMonth as CalendarIcon,
  ShoppingBag as ShoppingBagIcon,
  Star as StarIcon,
  Chat as ChatIcon,
  VerifiedUser as VerifiedUserIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import mockApiService, { User, Booking, Order, Activity } from '../../services/mockData';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-detail-tabpanel-${index}`}
      aria-labelledby={`customer-detail-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Dummy data for pets
interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  avatar?: string;
}

const mockPets: Pet[] = [
  {
    id: 'pet-001',
    name: 'Max',
    type: 'Dog',
    breed: 'Golden Retriever',
    age: 3,
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg'
  },
  {
    id: 'pet-002',
    name: 'Luna',
    type: 'Cat',
    breed: 'Persian',
    age: 2,
    avatar: 'https://randomuser.me/api/portraits/lego/2.jpg'
  }
];

// Dummy data for addresses
interface Address {
  id: string;
  type: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

const mockAddresses: Address[] = [
  {
    id: 'addr-001',
    type: 'Home',
    street: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States',
    isDefault: true
  },
  {
    id: 'addr-002',
    type: 'Work',
    street: '456 Park Avenue',
    city: 'New York',
    state: 'NY',
    zipCode: '10022',
    country: 'United States',
    isDefault: false
  }
];

const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [customer, setCustomer] = useState<User | null>(null);
  const [customerBookings, setCustomerBookings] = useState<Booking[]>([]);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [customerActivities, setCustomerActivities] = useState<Activity[]>([]);
  const [customerPets, setCustomerPets] = useState<Pet[]>(mockPets);
  const [customerAddresses, setCustomerAddresses] = useState<Address[]>(mockAddresses);
  const [tabValue, setTabValue] = useState(0);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState('');

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch customer data
        const fetchedUser = await mockApiService.getUserById(id);
        if (fetchedUser) {
          setCustomer(fetchedUser);
        }
        
        // Fetch bookings for this customer
        const allBookings = await mockApiService.getBookings();
        const customerBookings = allBookings.filter(booking => booking.ownerId === id);
        setCustomerBookings(customerBookings);
        
        // Fetch orders for this customer
        const allOrders = await mockApiService.getOrders();
        const customerOrders = allOrders.filter(order => order.userId === id);
        setCustomerOrders(customerOrders);
        
        // Fetch recent activities
        const recentActivities = await mockApiService.getRecentActivities();
        const customerActivities = recentActivities.filter(activity => activity.userId === id);
        setCustomerActivities(customerActivities);
        
      } catch (error) {
        console.error('Error fetching customer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBackToList = () => {
    navigate('/customers');
  };

  const handleEditCustomer = () => {
    if (!customer) return;
    navigate(`/customers/edit/${customer.id}`);
  };

  const handleDeactivateCustomer = () => {
    setDialogAction('deactivate');
    setConfirmDialogOpen(true);
  };

  const handleDeleteCustomer = () => {
    setDialogAction('delete');
    setConfirmDialogOpen(true);
  };

  const handleSendEmail = () => {
    if (!customer) return;
    console.log(`Send email to ${customer.email}`);
    // Implement email sending logic
  };

  const handleConfirmAction = () => {
    if (!customer) return;
    
    if (dialogAction === 'deactivate') {
      console.log(`Deactivate customer ${customer.id}`);
      // Implement deactivation logic
    } else if (dialogAction === 'delete') {
      console.log(`Delete customer ${customer.id}`);
      // Implement deletion logic
      navigate('/customers');
    }
    
    setConfirmDialogOpen(false);
  };

  const handleCancelAction = () => {
    setConfirmDialogOpen(false);
  };

  // Get status chip color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get booking status color
  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'no_show':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Get order status color
  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'shipped':
        return 'info';
      case 'processing':
        return 'warning';
      case 'pending':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading customer details...</Typography>
      </Container>
    );
  }

  if (!customer) {
    return (
      <Container>
        <Typography color="error">Customer not found</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBackToList}>
          Back to Customer List
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBackToList}>
            Back
          </Button>
          <Typography variant="h4">
            Customer Profile
          </Typography>
          <Chip 
            label={customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
            color={getStatusColor(customer.status) as any}
          />
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="info"
            startIcon={<EmailIcon />}
            onClick={handleSendEmail}
          >
            Send Email
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleEditCustomer}
          >
            Edit
          </Button>
          {customer.status === 'active' ? (
            <Button
              variant="contained"
              color="warning"
              startIcon={<BlockIcon />}
              onClick={handleDeactivateCustomer}
            >
              Deactivate
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              startIcon={<VerifiedUserIcon />}
              onClick={handleDeactivateCustomer}
            >
              Activate
            </Button>
          )}
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteCustomer}
          >
            Delete
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {/* Customer Summary Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar
                  src={customer.avatar}
                  alt={customer.name}
                  sx={{ width: 120, height: 120, mb: 2 }}
                >
                  {customer.name.charAt(0)}
                </Avatar>
                <Typography variant="h5" gutterBottom>{customer.name}</Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2">{customer.email}</Typography>
                </Stack>
                {customer.phone && (
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2">{customer.phone}</Typography>
                  </Stack>
                )}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Member Since</Typography>
                  <Typography variant="body2">{customer.joinDate}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Pets</Typography>
                  <Typography variant="body2">{customerPets.length}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Bookings</Typography>
                  <Typography variant="body2">{customerBookings.length}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Orders</Typography>
                  <Typography variant="body2">{customerOrders.length}</Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Customer Detailed Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="customer detail tabs">
                <Tab label="Pets" />
                <Tab label="Bookings" />
                <Tab label="Orders" />
                <Tab label="Addresses" />
                <Tab label="Activity" />
                <Tab label="Reviews" />
              </Tabs>
            </Box>

            {/* Pets Tab */}
            <TabPanel value={tabValue} index={0}>
              {customerPets.length === 0 ? (
                <Typography>No pets found for this customer.</Typography>
              ) : (
                <Grid container spacing={3}>
                  {customerPets.map((pet) => (
                    <Grid item xs={12} sm={6} key={pet.id}>
                      <Card>
                        <CardContent>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar src={pet.avatar} alt={pet.name} sx={{ width: 60, height: 60 }}>
                              <PetsIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="h6">{pet.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {pet.type} • {pet.breed}
                              </Typography>
                              <Typography variant="body2">
                                {pet.age} {pet.age === 1 ? 'year' : 'years'} old
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </TabPanel>

            {/* Bookings Tab */}
            <TabPanel value={tabValue} index={1}>
              {customerBookings.length === 0 ? (
                <Typography>No bookings found for this customer.</Typography>
              ) : (
                <List>
                  {customerBookings.map((booking) => (
                    <Paper key={booking.id} sx={{ mb: 2, p: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle1">
                            {booking.serviceType} for {booking.petName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            at {booking.clinicName} • {booking.date} • {booking.time}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Doctor: {booking.doctorName}
                          </Typography>
                          {booking.notes && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              Notes: {booking.notes}
                            </Typography>
                          )}
                        </Box>
                        <Chip 
                          label={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)} 
                          color={getBookingStatusColor(booking.status) as any}
                        />
                      </Stack>
                    </Paper>
                  ))}
                </List>
              )}
            </TabPanel>

            {/* Orders Tab */}
            <TabPanel value={tabValue} index={2}>
              {customerOrders.length === 0 ? (
                <Typography>No orders found for this customer.</Typography>
              ) : (
                <List>
                  {customerOrders.map((order) => (
                    <Paper key={order.id} sx={{ mb: 2, p: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle1">
                            Order #{order.id}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(order.createdAt).toLocaleDateString()} • 
                            ${order.total.toFixed(2)} • 
                            {order.items.length} items
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {order.items.map(item => item.productName).join(', ')}
                          </Typography>
                        </Box>
                        <Stack>
                          <Chip 
                            label={order.status.charAt(0).toUpperCase() + order.status.slice(1)} 
                            color={getOrderStatusColor(order.status) as any}
                            size="small"
                            sx={{ mb: 1 }}
                          />
                          <Chip 
                            label={order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)} 
                            variant="outlined"
                            size="small"
                          />
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                </List>
              )}
            </TabPanel>

            {/* Addresses Tab */}
            <TabPanel value={tabValue} index={3}>
              {customerAddresses.length === 0 ? (
                <Typography>No addresses found for this customer.</Typography>
              ) : (
                <Grid container spacing={3}>
                  {customerAddresses.map((address) => (
                    <Grid item xs={12} sm={6} key={address.id}>
                      <Card>
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="subtitle1">{address.type}</Typography>
                            {address.isDefault && (
                              <Chip label="Default" color="primary" size="small" />
                            )}
                          </Stack>
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2">{address.street}</Typography>
                            <Typography variant="body2">
                              {address.city}, {address.state} {address.zipCode}
                            </Typography>
                            <Typography variant="body2">{address.country}</Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </TabPanel>

            {/* Activity Tab */}
            <TabPanel value={tabValue} index={4}>
              {customerActivities.length === 0 ? (
                <Typography>No activity found for this customer.</Typography>
              ) : (
                <List>
                  {customerActivities.map((activity) => (
                    <ListItem key={activity.id} divider>
                      <ListItemAvatar>
                        <Avatar>
                          {activity.type === 'booking_created' && <CalendarIcon />}
                          {activity.type === 'booking_completed' && <CalendarIcon />}
                          {activity.type === 'booking_cancelled' && <CalendarIcon />}
                          {activity.type === 'order_placed' && <ShoppingBagIcon />}
                          {activity.type === 'order_delivered' && <ShoppingBagIcon />}
                          {activity.type === 'review_submitted' && <StarIcon />}
                          {activity.type === 'user_registration' && <VerifiedUserIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={activity.description} 
                        secondary={`${activity.details} • ${new Date(activity.createdAt).toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </TabPanel>

            {/* Reviews Tab */}
            <TabPanel value={tabValue} index={5}>
              <Typography>Customer reviews will be displayed here.</Typography>
            </TabPanel>
          </Card>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelAction}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          {dialogAction === 'deactivate' 
            ? 'Deactivate Customer Account' 
            : 'Delete Customer Account'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {dialogAction === 'deactivate'
              ? `Are you sure you want to deactivate ${customer.name}'s account? They will not be able to access the system until reactivated.`
              : `Are you sure you want to permanently delete ${customer.name}'s account? This action cannot be undone.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAction}>Cancel</Button>
          <Button onClick={handleConfirmAction} color="error" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CustomerDetailPage;
