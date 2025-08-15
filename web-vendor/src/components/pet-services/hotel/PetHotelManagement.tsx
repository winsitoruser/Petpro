import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import RoomList from './RoomList';
import BookingList from './BookingList';

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
      id={`hotel-tabpanel-${index}`}
      aria-labelledby={`hotel-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const PetHotelManagement = () => {
  const { t } = useTranslation('petServices');
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [openRoomDialog, setOpenRoomDialog] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomFormData, setRoomFormData] = useState({
    name: '',
    petType: 'dog',
    petSize: 'any',
    capacity: 1,
    pricePerNight: 0,
    amenities: [],
    description: ''
  });

  useEffect(() => {
    // Fetch hotel rooms and bookings
    const fetchHotelData = async () => {
      setLoading(true);
      try {
        // This would be replaced with actual API calls
        // const roomsData = await api.getVendorHotelRooms(user.vendorId);
        // const bookingsData = await api.getVendorHotelBookings(user.vendorId);
        
        // Mock data for now
        const mockRooms = [
          {
            id: '1',
            name: 'Luxury Suite',
            petType: 'dog',
            petSize: 'large',
            capacity: 2,
            pricePerNight: 75.00,
            amenities: ['Air Conditioning', 'Premium Bedding', 'Toys'],
            description: 'Spacious luxury suite for large dogs with premium amenities',
            isAvailable: true,
            photos: ['https://example.com/room1.jpg']
          },
          {
            id: '2',
            name: 'Cat Condo',
            petType: 'cat',
            petSize: 'any',
            capacity: 1,
            pricePerNight: 45.00,
            amenities: ['Climbing Tree', 'Window View', 'Toys'],
            description: 'Cozy space for cats with climbing areas',
            isAvailable: true,
            photos: ['https://example.com/room2.jpg']
          },
        ];

        const mockBookings = [
          {
            id: '101',
            roomId: '1',
            roomName: 'Luxury Suite',
            petName: 'Max',
            petType: 'dog',
            ownerName: 'John Doe',
            checkInDate: '2025-08-20T14:00:00',
            checkOutDate: '2025-08-25T11:00:00',
            status: 'confirmed',
            totalPrice: 375.00
          },
          {
            id: '102',
            roomId: '2',
            roomName: 'Cat Condo',
            petName: 'Whiskers',
            petType: 'cat',
            ownerName: 'Jane Smith',
            checkInDate: '2025-08-17T15:00:00',
            checkOutDate: '2025-08-19T12:00:00',
            status: 'checked-in',
            totalPrice: 90.00
          },
        ];
        
        setRooms(mockRooms);
        setBookings(mockBookings);
      } catch (error) {
        console.error('Error fetching hotel data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotelData();
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenRoomDialog = () => {
    setOpenRoomDialog(true);
  };

  const handleCloseRoomDialog = () => {
    setOpenRoomDialog(false);
    // Reset form data
    setRoomFormData({
      name: '',
      petType: 'dog',
      petSize: 'any',
      capacity: 1,
      pricePerNight: 0,
      amenities: [],
      description: ''
    });
  };

  const handleRoomFormChange = (e) => {
    const { name, value } = e.target;
    setRoomFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveRoom = () => {
    // This would be replaced with an actual API call
    console.log('Saving room:', roomFormData);
    // Mock saving a room
    const newRoom = {
      id: `${Date.now()}`, // Mock ID
      ...roomFormData,
      isAvailable: true,
      photos: []
    };
    
    setRooms(prev => [...prev, newRoom]);
    handleCloseRoomDialog();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          {t('hotelManagement.title')}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenRoomDialog}
        >
          {t('hotelManagement.addRoom')}
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="hotel management tabs"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={t('hotelManagement.tabs.rooms')} />
          <Tab label={t('hotelManagement.tabs.bookings')} />
          <Tab label={t('hotelManagement.tabs.availability')} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <RoomList rooms={rooms} loading={loading} />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <BookingList bookings={bookings} loading={loading} />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <Box p={3}>
          <Typography variant="h6">{t('hotelManagement.availability.title')}</Typography>
          <Typography variant="body1">{t('hotelManagement.availability.description')}</Typography>
          {/* Calendar view would go here */}
          <Typography variant="body2" color="textSecondary" mt={2}>
            {t('common.comingSoon')}
          </Typography>
        </Box>
      </TabPanel>

      {/* Add Room Dialog */}
      <Dialog open={openRoomDialog} onClose={handleCloseRoomDialog} maxWidth="md" fullWidth>
        <DialogTitle>{t('hotelManagement.dialog.addRoom')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label={t('hotelManagement.form.name')}
                fullWidth
                value={roomFormData.name}
                onChange={handleRoomFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>{t('hotelManagement.form.petType')}</InputLabel>
                <Select
                  name="petType"
                  value={roomFormData.petType}
                  onChange={handleRoomFormChange}
                  label={t('hotelManagement.form.petType')}
                >
                  <MenuItem value="dog">{t('petTypes.dog')}</MenuItem>
                  <MenuItem value="cat">{t('petTypes.cat')}</MenuItem>
                  <MenuItem value="bird">{t('petTypes.bird')}</MenuItem>
                  <MenuItem value="small_animal">{t('petTypes.smallAnimal')}</MenuItem>
                  <MenuItem value="any">{t('petTypes.any')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>{t('hotelManagement.form.petSize')}</InputLabel>
                <Select
                  name="petSize"
                  value={roomFormData.petSize}
                  onChange={handleRoomFormChange}
                  label={t('hotelManagement.form.petSize')}
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
                name="capacity"
                label={t('hotelManagement.form.capacity')}
                type="number"
                InputProps={{ inputProps: { min: 1 } }}
                fullWidth
                value={roomFormData.capacity}
                onChange={handleRoomFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="pricePerNight"
                label={t('hotelManagement.form.pricePerNight')}
                type="number"
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                fullWidth
                value={roomFormData.pricePerNight}
                onChange={handleRoomFormChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label={t('hotelManagement.form.description')}
                multiline
                rows={4}
                fullWidth
                value={roomFormData.description}
                onChange={handleRoomFormChange}
              />
            </Grid>
            {/* Amenities selection would go here - omitted for brevity */}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRoomDialog}>{t('common.cancel')}</Button>
          <Button 
            onClick={handleSaveRoom} 
            variant="contained" 
            color="primary"
            disabled={!roomFormData.name || roomFormData.pricePerNight <= 0}
          >
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PetHotelManagement;
