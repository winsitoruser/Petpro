import React, { useState, useEffect } from 'react';
import { 
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Avatar,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Pets as PetsIcon,
  ShoppingBag as OrderIcon,
  Event as BookingIcon,
  Visibility as ViewIcon,
  Block as BlockIcon,
  MailOutline as EmailIcon,
} from '@mui/icons-material';
import mockApiService, { User } from '../../services/mockData';
import { useNavigate } from 'react-router-dom';

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
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CustomerManagementPage: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  // Load customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const fetchedUsers = await mockApiService.getUsers();
        // Filter only pet_owner role users
        const customerUsers = fetchedUsers.filter(user => user.role === 'pet_owner');
        setCustomers(customerUsers);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Handle filters and search
  const filteredCustomers = customers.filter(customer => {
    // Apply search filter
    const matchesSearch = 
      searchTerm === '' || 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = 
      statusFilter === 'all' || 
      customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Get status chip color based on status
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

  const viewCustomerDetails = (customerId: string) => {
    navigate(`/customers/${customerId}`);
  };

  const sendEmail = (customer: User) => {
    console.log(`Send email to ${customer.email}`);
    // Implement email sending logic
  };

  const toggleCustomerStatus = (customer: User) => {
    console.log(`Toggle status for ${customer.name} - current status: ${customer.status}`);
    // Implement status toggle logic
  };

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4" gutterBottom>
          Customer Management
        </Typography>
      </Stack>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="customer management tabs"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab label="All Customers" />
        <Tab label="Active Customers" />
        <Tab label="Pending Verification" />
        <Tab label="Inactive Customers" />
      </Tabs>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />}
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                sx={{ mr: 1 }}
              >
                Clear Filters
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<FilterListIcon />}
                onClick={() => {/* Advanced filter handler */}}
              >
                Advanced Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TabPanel value={tabValue} index={0}>
        <CustomerTable 
          customers={filteredCustomers}
          loading={loading}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          getStatusColor={getStatusColor}
          viewCustomerDetails={viewCustomerDetails}
          sendEmail={sendEmail}
          toggleCustomerStatus={toggleCustomerStatus}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <CustomerTable 
          customers={filteredCustomers.filter(c => c.status === 'active')}
          loading={loading}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          getStatusColor={getStatusColor}
          viewCustomerDetails={viewCustomerDetails}
          sendEmail={sendEmail}
          toggleCustomerStatus={toggleCustomerStatus}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <CustomerTable 
          customers={filteredCustomers.filter(c => c.status === 'pending')}
          loading={loading}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          getStatusColor={getStatusColor}
          viewCustomerDetails={viewCustomerDetails}
          sendEmail={sendEmail}
          toggleCustomerStatus={toggleCustomerStatus}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <CustomerTable 
          customers={filteredCustomers.filter(c => c.status === 'inactive')}
          loading={loading}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          getStatusColor={getStatusColor}
          viewCustomerDetails={viewCustomerDetails}
          sendEmail={sendEmail}
          toggleCustomerStatus={toggleCustomerStatus}
        />
      </TabPanel>
    </Container>
  );
};

interface CustomerTableProps {
  customers: User[];
  loading: boolean;
  page: number;
  rowsPerPage: number;
  handleChangePage: (event: unknown, newPage: number) => void;
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  getStatusColor: (status: string) => string;
  viewCustomerDetails: (customerId: string) => void;
  sendEmail: (customer: User) => void;
  toggleCustomerStatus: (customer: User) => void;
}

const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  loading,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  getStatusColor,
  viewCustomerDetails,
  sendEmail,
  toggleCustomerStatus
}) => {
  return (
    <Card>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer</TableCell>
              <TableCell>Join Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Pets</TableCell>
              <TableCell>Orders</TableCell>
              <TableCell>Bookings</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Loading...</TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">No customers found</TableCell>
              </TableRow>
            ) : (
              customers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((customer) => {
                  return (
                    <TableRow key={customer.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            src={customer.avatar} 
                            alt={customer.name} 
                            sx={{ mr: 2 }}
                          >
                            {customer.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" noWrap>
                              {customer.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                              {customer.email}
                            </Typography>
                            {customer.phone && (
                              <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                                {customer.phone}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{customer.joinDate}</TableCell>
                      <TableCell>
                        <Chip 
                          label={customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                          color={getStatusColor(customer.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <PetsIcon fontSize="small" color="primary" />
                          <Typography variant="body2">2</Typography> {/* Mock data */}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <OrderIcon fontSize="small" color="primary" />
                          <Typography variant="body2">3</Typography> {/* Mock data */}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <BookingIcon fontSize="small" color="primary" />
                          <Typography variant="body2">5</Typography> {/* Mock data */}
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          size="small"
                          onClick={() => viewCustomerDetails(customer.id)}
                          title="View details"
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small"
                          onClick={() => sendEmail(customer)}
                          title="Send email"
                        >
                          <EmailIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small"
                          onClick={() => toggleCustomerStatus(customer)}
                          title={customer.status === 'active' ? 'Deactivate customer' : 'Activate customer'}
                        >
                          <BlockIcon fontSize="small" color={customer.status === 'active' ? 'error' : 'success'} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={customers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Card>
  );
};

export default CustomerManagementPage;
