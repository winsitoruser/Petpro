import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarTodayIcon,
  EventNote as EventNoteIcon
} from '@mui/icons-material';
import mockApiService, { Booking } from '../../services/mockData';

const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [tabValue, setTabValue] = useState<number>(0);

  // Load bookings on component mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const fetchedBookings = await mockApiService.getBookings();
        setBookings(fetchedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Reset filters when changing tabs
    setPage(0);
    
    // Set status filter based on tab
    switch (newValue) {
      case 0: // All
        setStatusFilter('all');
        break;
      case 1: // Scheduled
        setStatusFilter('scheduled');
        break;
      case 2: // Completed
        setStatusFilter('completed');
        break;
      case 3: // Cancelled
        setStatusFilter('cancelled');
        break;
      case 4: // No Show
        setStatusFilter('no_show');
        break;
      default:
        setStatusFilter('all');
    }
  };

  // Handle filters and search
  const filteredBookings = bookings.filter(booking => {
    // Apply search filter
    const matchesSearch = 
      searchTerm === '' || 
      booking.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.clinicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = 
      statusFilter === 'all' || 
      booking.status === statusFilter;
    
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

  // Get status chip color based on status
  const getStatusColor = (status: string) => {
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

  // Format date string
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" gutterBottom>
          Bookings
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {/* Add booking handler */}}
        >
          Create Booking
        </Button>
      </Stack>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ pb: 0 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="booking status tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 1 }}
          >
            <Tab label="All Bookings" />
            <Tab label="Scheduled" />
            <Tab label="Completed" />
            <Tab label="Cancelled" />
            <Tab label="No Show" />
          </Tabs>
        </CardContent>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6} lg={5}>
              <TextField
                fullWidth
                placeholder="Search bookings..."
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
            <Grid item xs={12} md={6} lg={7} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
              <Button 
                variant="outlined" 
                startIcon={<CalendarTodayIcon />}
              >
                Today
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<EventNoteIcon />}
              >
                This Week
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />}
                onClick={() => {
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<FilterListIcon />}
                onClick={() => {/* Advanced filter handler */}}
              >
                Advanced
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Pet & Owner</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Clinic & Doctor</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">Loading...</TableCell>
                </TableRow>
              ) : filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">No bookings found</TableCell>
                </TableRow>
              ) : (
                filteredBookings
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((booking) => (
                    <TableRow key={booking.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" noWrap>
                          {booking.petName} ({booking.petType})
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                          Owner: {booking.ownerName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {booking.serviceType}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" noWrap>
                          {booking.clinicName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                          Dr. {booking.doctorName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {formatDate(booking.date)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {booking.time}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('_', ' ')}
                          color={getStatusColor(booking.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button 
                          size="small" 
                          variant="outlined"
                          onClick={() => {/* View details handler */}}
                        >
                          View
                        </Button>
                        <IconButton 
                          size="small"
                          sx={{ ml: 1 }}
                          onClick={() => {/* Edit booking handler */}}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredBookings.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          {filteredBookings.length} bookings found
        </Typography>
        <Button variant="outlined" startIcon={<RefreshIcon />}>
          Refresh Data
        </Button>
      </Box>
    </Container>
  );
};

export default BookingsPage;
