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
  FormControl,
  InputLabel,
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
  Rating,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import mockApiService, { Clinic } from '../../services/mockData';

const ClinicsPage: React.FC = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Load clinics on component mount
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        setLoading(true);
        const fetchedClinics = await mockApiService.getClinics();
        setClinics(fetchedClinics);
      } catch (error) {
        console.error('Error fetching clinics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, []);

  // Handle filters and search
  const filteredClinics = clinics.filter(clinic => {
    // Apply search filter
    const matchesSearch = 
      searchTerm === '' || 
      clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.state.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = 
      statusFilter === 'all' || 
      clinic.status === statusFilter;
    
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

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4" gutterBottom>
          Veterinary Clinics
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {/* Add clinic handler */}}
        >
          Add Clinic
        </Button>
      </Stack>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search clinics by name or location..."
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
            <Grid item xs={12} md={2}>
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
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
                Advanced
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {loading ? (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 5 }}>
                Loading clinics...
              </CardContent>
            </Card>
          </Grid>
        ) : filteredClinics.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 5 }}>
                No clinics found
              </CardContent>
            </Card>
          </Grid>
        ) : (
          filteredClinics
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((clinic) => (
              <Grid item key={clinic.id} xs={12} md={6} lg={4}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" component="h2" gutterBottom>
                          {clinic.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Rating value={clinic.rating} precision={0.5} readOnly size="small" />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            ({clinic.rating.toFixed(1)}) • {clinic.doctorsCount} Doctors
                          </Typography>
                        </Box>
                      </Box>
                      <Chip 
                        label={clinic.status.charAt(0).toUpperCase() + clinic.status.slice(1)}
                        color={getStatusColor(clinic.status) as any}
                        size="small"
                      />
                    </Box>
                    
                    <Stack spacing={1} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2">
                          {clinic.address}, {clinic.city}, {clinic.state} {clinic.zipCode}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2">
                          {clinic.phone}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2">
                          {clinic.email}
                        </Typography>
                      </Box>
                      {clinic.website && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LanguageIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                          <Typography variant="body2" component="a" href={clinic.website} target="_blank" sx={{ color: 'primary.main' }}>
                            {clinic.website.replace(/^https?:\/\//, '')}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Services:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {clinic.servicesOffered.slice(0, 3).map((service, index) => (
                        <Chip key={index} label={service} size="small" />
                      ))}
                      {clinic.servicesOffered.length > 3 && (
                        <Chip 
                          label={`+${clinic.servicesOffered.length - 3} more`} 
                          size="small" 
                          variant="outlined" 
                        />
                      )}
                    </Box>
                    
                    <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
                      Registered on {clinic.registrationDate}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button size="small" onClick={() => {/* View details handler */}}>
                      View Details
                    </Button>
                    <IconButton size="small" onClick={() => {/* Edit clinic handler */}}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => {/* More options handler */}}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Card>
              </Grid>
            ))
        )}
      </Grid>
      
      <Box sx={{ mt: 3 }}>
        <TablePagination
          component="div"
          count={filteredClinics.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[6, 12, 24]}
        />
      </Box>
    </Container>
  );
};

export default ClinicsPage;
