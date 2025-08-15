import React from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Stack,
  Divider,
  Tooltip
} from '@mui/material';
import { 
  Home as HomeIcon,
  Pets as PetsIcon,
  ContentCut as GroomingIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Room as RoomIcon
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { styled } from '@mui/system';

const StyledSummaryBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: 'none',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[2],
    borderColor: theme.palette.primary.light,
  }
}));

const StyledInfoTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  fontWeight: 500,
}));

const StyledValueText = styled(Typography)(({ theme }) => ({
  fontSize: '1.75rem',
  fontWeight: 700,
  color: theme.palette.text.primary,
  lineHeight: 1.2,
}));

interface AnalyticsSummaryProps {
  hotelRooms: number;
  activeBookings: number;
  checkedInPets: number;
  groomingServices: number;
  upcomingGroomings: number;
  totalRevenue: number;
}

const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({
  hotelRooms,
  activeBookings,
  checkedInPets,
  groomingServices,
  upcomingGroomings,
  totalRevenue,
}) => {
  const { t } = useTranslation('petServices');

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <StyledSummaryBox>
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <MoneyIcon color="primary" />
            <Typography variant="h6">{t('analytics.revenue')}</Typography>
          </Stack>
          <StyledValueText>
            {new Intl.NumberFormat('en-US', { 
              style: 'currency', 
              currency: 'USD' 
            }).format(totalRevenue)}
          </StyledValueText>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {t('analytics.currentMonth')}
          </Typography>
        </StyledSummaryBox>
      </Grid>

      <Grid item xs={12} sm={6}>
        <StyledSummaryBox>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <RoomIcon color="info" />
              <StyledInfoTitle>{t('analytics.rooms')}</StyledInfoTitle>
            </Stack>
            <Tooltip title={t('analytics.totalRoomsAvailable')} arrow>
              <Typography variant="body2" color="primary">
                {t('common.info')}
              </Typography>
            </Tooltip>
          </Box>
          <StyledValueText>{hotelRooms}</StyledValueText>
        </StyledSummaryBox>
      </Grid>

      <Grid item xs={12} sm={6}>
        <StyledSummaryBox>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CalendarIcon color="warning" />
              <StyledInfoTitle>{t('analytics.activeBookings')}</StyledInfoTitle>
            </Stack>
          </Box>
          <StyledValueText>{activeBookings}</StyledValueText>
        </StyledSummaryBox>
      </Grid>

      <Grid item xs={12} sm={6}>
        <StyledSummaryBox>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <PetsIcon color="success" />
              <StyledInfoTitle>{t('analytics.checkedInPets')}</StyledInfoTitle>
            </Stack>
          </Box>
          <StyledValueText>{checkedInPets}</StyledValueText>
        </StyledSummaryBox>
      </Grid>

      <Grid item xs={12} sm={6}>
        <StyledSummaryBox>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <GroomingIcon color="secondary" />
              <StyledInfoTitle>{t('analytics.upcomingGroomings')}</StyledInfoTitle>
            </Stack>
          </Box>
          <StyledValueText>{upcomingGroomings}</StyledValueText>
        </StyledSummaryBox>
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 1 }} />
        <Box display="flex" justifyContent="space-between" py={1}>
          <Typography variant="subtitle2" color="text.secondary">
            {t('analytics.groomingServices')}
          </Typography>
          <Typography variant="subtitle2" fontWeight="bold">
            {groomingServices}
          </Typography>
        </Box>
        <Divider />
      </Grid>
    </Grid>
  );
};

export default AnalyticsSummary;
