import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Chip,
  Button,
  Skeleton,
  IconButton,
  Stack,
  Divider
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';

interface Amenity {
  name: string;
}

interface RoomProps {
  id: string;
  name: string;
  petType: string;
  petSize: string;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  description: string;
  isAvailable: boolean;
  photos: string[];
}

interface RoomListProps {
  rooms: RoomProps[];
  loading: boolean;
}

const RoomList: React.FC<RoomListProps> = ({ rooms, loading }) => {
  const { t } = useTranslation('petServices');

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3].map((item) => (
          <Grid item xs={12} md={6} lg={4} key={item}>
            <Card>
              <Skeleton variant="rectangular" height={140} />
              <CardContent>
                <Skeleton variant="text" height={30} width="80%" />
                <Skeleton variant="text" height={20} width="60%" />
                <Box sx={{ mt: 2 }}>
                  <Skeleton variant="text" height={20} width="100%" />
                  <Skeleton variant="text" height={20} width="90%" />
                </Box>
              </CardContent>
              <CardActions>
                <Skeleton variant="rectangular" width={100} height={36} />
                <Skeleton variant="circular" width={36} height={36} sx={{ ml: 1 }} />
                <Skeleton variant="circular" width={36} height={36} sx={{ ml: 1 }} />
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!rooms || rooms.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          {t('hotelManagement.rooms.noRooms')}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {t('hotelManagement.rooms.addRoomPrompt')}
        </Typography>
      </Box>
    );
  }

  const getPetTypeLabel = (type) => {
    return t(`petTypes.${type}`);
  };

  const getPetSizeLabel = (size) => {
    return t(`petSizes.${size}`);
  };

  return (
    <Grid container spacing={3}>
      {rooms.map((room) => (
        <Grid item xs={12} md={6} lg={4} key={room.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {room.photos && room.photos.length > 0 ? (
              <CardMedia
                component="img"
                height={180}
                image={room.photos[0]}
                alt={room.name}
              />
            ) : (
              <Box
                sx={{
                  height: 180,
                  backgroundColor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="body2" color="textSecondary">
                  {t('common.noImage')}
                </Typography>
              </Box>
            )}
            
            <CardContent sx={{ flexGrow: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="h6" component="div" gutterBottom>
                  {room.name}
                </Typography>
                <Chip
                  label={room.isAvailable 
                    ? t('hotelManagement.rooms.available') 
                    : t('hotelManagement.rooms.unavailable')}
                  color={room.isAvailable ? 'success' : 'error'}
                  size="small"
                />
              </Box>

              <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                <Chip 
                  label={getPetTypeLabel(room.petType)}
                  size="small"
                  variant="outlined"
                />
                <Chip 
                  label={getPetSizeLabel(room.petSize)}
                  size="small"
                  variant="outlined"
                />
                <Chip 
                  label={t('hotelManagement.rooms.capacity', { count: room.capacity })}
                  size="small"
                  variant="outlined"
                />
              </Stack>

              <Typography variant="body2" color="text.secondary">
                {room.description}
              </Typography>
              
              <Divider sx={{ my: 1.5 }} />
              
              <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                {new Intl.NumberFormat('en-US', { 
                  style: 'currency', 
                  currency: 'USD' 
                }).format(room.pricePerNight)} / {t('common.night')}
              </Typography>
              
              {room.amenities && room.amenities.length > 0 && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="subtitle2">
                    {t('hotelManagement.rooms.amenities')}:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {room.amenities.slice(0, 3).map((amenity, index) => (
                      <Chip key={index} label={amenity} size="small" />
                    ))}
                    {room.amenities.length > 3 && (
                      <Chip 
                        label={`+${room.amenities.length - 3}`} 
                        size="small" 
                        variant="outlined" 
                      />
                    )}
                  </Box>
                </Box>
              )}
            </CardContent>
            
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button
                size="small"
                startIcon={<VisibilityIcon />}
              >
                {t('common.view')}
              </Button>
              <IconButton size="small" color="primary">
                <EditIcon />
              </IconButton>
              <IconButton size="small" color="error">
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default RoomList;
