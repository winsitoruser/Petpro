import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  Skeleton,
  IconButton,
  Stack,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
  Pets as PetIcon
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';

interface ServiceProps {
  id: string;
  name: string;
  petType: string;
  petSize: string;
  duration: number;
  price: number;
  description: string;
  isActive: boolean;
}

interface ServiceListProps {
  services: ServiceProps[];
  loading: boolean;
}

const ServiceList: React.FC<ServiceListProps> = ({ services, loading }) => {
  const { t } = useTranslation('petServices');

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3].map((item) => (
          <Grid item xs={12} md={6} lg={4} key={item}>
            <Card>
              <CardContent>
                <Skeleton variant="text" height={30} width="80%" />
                <Skeleton variant="text" height={20} width="60%" />
                <Box sx={{ mt: 2 }}>
                  <Skeleton variant="text" height={20} width="100%" />
                  <Skeleton variant="text" height={20} width="90%" />
                </Box>
                <Skeleton variant="text" height={30} width="40%" sx={{ mt: 2 }} />
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

  if (!services || services.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          {t('groomingManagement.services.noServices')}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {t('groomingManagement.services.addServicePrompt')}
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

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} ${t('common.minutes')}`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} ${hours === 1 ? t('common.hour') : t('common.hours')}`;
    }
    return `${hours} ${hours === 1 ? t('common.hour') : t('common.hours')} ${mins} ${t('common.minutes')}`;
  };

  return (
    <Grid container spacing={3}>
      {services.map((service) => (
        <Grid item xs={12} sm={6} md={4} key={service.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="h6" component="div" gutterBottom>
                  {service.name}
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={service.isActive}
                      color="success"
                      size="small"
                    />
                  }
                  label={service.isActive ? t('common.active') : t('common.inactive')}
                />
              </Box>

              <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                <Chip 
                  label={getPetTypeLabel(service.petType)}
                  size="small"
                  variant="outlined"
                  icon={<PetIcon fontSize="small" />}
                />
                <Chip 
                  label={getPetSizeLabel(service.petSize)}
                  size="small"
                  variant="outlined"
                />
                <Chip 
                  label={formatDuration(service.duration)}
                  size="small"
                  variant="outlined"
                  icon={<TimeIcon fontSize="small" />}
                />
              </Stack>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {service.description}
              </Typography>
              
              <Typography variant="h6" color="primary">
                {new Intl.NumberFormat('en-US', { 
                  style: 'currency', 
                  currency: 'USD' 
                }).format(service.price)}
              </Typography>
            </CardContent>
            
            <Divider />
            
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button
                size="small"
                startIcon={<EditIcon />}
              >
                {t('common.edit')}
              </Button>
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

export default ServiceList;
