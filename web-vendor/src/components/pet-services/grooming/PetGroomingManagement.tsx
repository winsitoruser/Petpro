import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Button, 
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import ServiceList from './ServiceList';
import AppointmentList from './AppointmentList';

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
      id={`grooming-tabpanel-${index}`}
      aria-labelledby={`grooming-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const PetGroomingManagement = () => {
  const { t } = useTranslation('petServices');
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [openServiceDialog, setOpenServiceDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    petType: 'dog',
    petSize: 'any',
    duration: 30,
    price: 0,
    description: ''
  });

  useEffect(() => {
    // Fetch grooming services and appointments
    const fetchGroomingData = async () => {
      setLoading(true);
      try {
        // This would be replaced with actual API calls
        // const servicesData = await api.getVendorGroomingServices(user.vendorId);
        // const appointmentsData = await api.getVendorGroomingAppointments(user.vendorId);
        
        // Mock data for now
        const mockServices = [
          {
            id: '1',
            name: 'Basic Bath & Brush',
            petType: 'dog',
            petSize: 'any',
            duration: 45,
            price: 35.00,
            description: 'Basic bathing service with shampoo, conditioner, brush out, ear cleaning, and nail trim.',
            isActive: true,
          },
          {
            id: '2',
            name: 'Full Grooming',
            petType: 'dog',
            petSize: 'medium',
            duration: 90,
            price: 65.00,
            description: 'Complete grooming service including bath, haircut, brush, nail trim, ear cleaning, and teeth brushing.',
            isActive: true,
          },
          {
            id: '3',
            name: 'Cat Grooming',
            petType: 'cat',
            petSize: 'any',
            duration: 60,
            price: 55.00,
            description: 'Specialized cat grooming service including gentle bathing, brushing, and nail trimming.',
            isActive: true,
          }
        ];

        const mockAppointments = [
          {
            id: '201',
            serviceId: '1',
            serviceName: 'Basic Bath & Brush',
            petName: 'Bella',
            petType: 'dog',
            petBreed: 'Golden Retriever',
            ownerName: 'Emily Johnson',
            date: '2025-08-18T10:00:00',
            duration: 45,
            status: 'confirmed',
            price: 35.00
          },
          {
            id: '202',
            serviceId: '2',
            serviceName: 'Full Grooming',
            petName: 'Charlie',
            petType: 'dog',
            petBreed: 'Poodle',
            ownerName: 'Michael Smith',
            date: '2025-08-18T14:00:00',
            duration: 90,
            status: 'pending',
            price: 65.00
          },
          {
            id: '203',
            serviceId: '3',
            serviceName: 'Cat Grooming',
            petName: 'Milo',
            petType: 'cat',
            petBreed: 'Persian',
            ownerName: 'Sophia Wilson',
            date: '2025-08-19T11:00:00',
            duration: 60,
            status: 'completed',
            price: 55.00
          }
        ];
        
        setServices(mockServices);
        setAppointments(mockAppointments);
      } catch (error) {
        console.error('Error fetching grooming data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroomingData();
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenServiceDialog = () => {
    setOpenServiceDialog(true);
  };

  const handleCloseServiceDialog = () => {
    setOpenServiceDialog(false);
    // Reset form data
    setServiceFormData({
      name: '',
      petType: 'dog',
      petSize: 'any',
      duration: 30,
      price: 0,
      description: ''
    });
  };

  const handleServiceFormChange = (e) => {
    const { name, value } = e.target;
    setServiceFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveService = () => {
    // This would be replaced with an actual API call
    console.log('Saving service:', serviceFormData);
    // Mock saving a service
    const newService = {
      id: `${Date.now()}`, // Mock ID
      ...serviceFormData,
      isActive: true
    };
    
    setServices(prev => [...prev, newService]);
    handleCloseServiceDialog();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          {t('groomingManagement.title')}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenServiceDialog}
        >
          {t('groomingManagement.addService')}
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="grooming management tabs"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={t('groomingManagement.tabs.services')} />
          <Tab label={t('groomingManagement.tabs.appointments')} />
          <Tab label={t('groomingManagement.tabs.schedule')} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <ServiceList services={services} loading={loading} />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <AppointmentList appointments={appointments} loading={loading} />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <Box p={3}>
          <Typography variant="h6">{t('groomingManagement.schedule.title')}</Typography>
          <Typography variant="body1">{t('groomingManagement.schedule.description')}</Typography>
          {/* Calendar schedule view would go here */}
          <Typography variant="body2" color="textSecondary" mt={2}>
            {t('common.comingSoon')}
          </Typography>
        </Box>
      </TabPanel>

      {/* Add Service Dialog */}
      <Dialog open={openServiceDialog} onClose={handleCloseServiceDialog} maxWidth="md" fullWidth>
        <DialogTitle>{t('groomingManagement.dialog.addService')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label={t('groomingManagement.form.name')}
                fullWidth
                value={serviceFormData.name}
                onChange={handleServiceFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>{t('groomingManagement.form.petType')}</InputLabel>
                <Select
                  name="petType"
                  value={serviceFormData.petType}
                  onChange={handleServiceFormChange}
                  label={t('groomingManagement.form.petType')}
                >
                  <MenuItem value="dog">{t('petTypes.dog')}</MenuItem>
                  <MenuItem value="cat">{t('petTypes.cat')}</MenuItem>
                  <MenuItem value="small_animal">{t('petTypes.smallAnimal')}</MenuItem>
                  <MenuItem value="any">{t('petTypes.any')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>{t('groomingManagement.form.petSize')}</InputLabel>
                <Select
                  name="petSize"
                  value={serviceFormData.petSize}
                  onChange={handleServiceFormChange}
                  label={t('groomingManagement.form.petSize')}
                >
                  <MenuItem value="small">{t('petSizes.small')}</MenuItem>
                  <MenuItem value="medium">{t('petSizes.medium')}</MenuItem>
                  <MenuItem value="large">{t('petSizes.large')}</MenuItem>
                  <MenuItem value="any">{t('petSizes.any')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="duration"
                label={t('groomingManagement.form.durationMinutes')}
                type="number"
                InputProps={{ inputProps: { min: 15, step: 5 } }}
                fullWidth
                value={serviceFormData.duration}
                onChange={handleServiceFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="price"
                label={t('groomingManagement.form.price')}
                type="number"
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                fullWidth
                value={serviceFormData.price}
                onChange={handleServiceFormChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label={t('groomingManagement.form.description')}
                multiline
                rows={4}
                fullWidth
                value={serviceFormData.description}
                onChange={handleServiceFormChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseServiceDialog}>{t('common.cancel')}</Button>
          <Button 
            onClick={handleSaveService} 
            variant="contained" 
            color="primary"
            disabled={!serviceFormData.name || serviceFormData.price <= 0}
          >
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PetGroomingManagement;
