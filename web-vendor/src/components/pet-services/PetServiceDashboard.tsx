import React, { useState, useEffect } from 'react';
import { Box, Tab, Tabs, Typography, Grid, Paper, Container } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { styled } from '@mui/system';
import PetHotelManagement from './hotel/PetHotelManagement';
import PetGroomingManagement from './grooming/PetGroomingManagement';
import AnalyticsSummary from './analytics/AnalyticsSummary';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';

// Styled components
const StyledDashboardContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(2),
}));

const StyledSummaryPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  borderRadius: theme.shape.borderRadius,
}));

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
      id={`pet-service-tabpanel-${index}`}
      aria-labelledby={`pet-service-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `pet-service-tab-${index}`,
    'aria-controls': `pet-service-tabpanel-${index}`,
  };
}

const PetServiceDashboard = () => {
  const { t } = useTranslation('petServices');
  const [tabValue, setTabValue] = useState(0);
  const { user } = useAuth();
  const router = useRouter();
  const [serviceSummary, setServiceSummary] = useState({
    hotelRooms: 0,
    activeBookings: 0,
    checkedInPets: 0,
    groomingServices: 0,
    upcomingGroomings: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    // Redirect if not logged in or not a vendor
    if (!user || user.role !== 'vendor') {
      router.push('/login');
      return;
    }

    // Fetch service summary data
    const fetchSummaryData = async () => {
      try {
        // This would be replaced with actual API calls
        // const hotelStats = await api.getVendorHotelStatistics(user.vendorId);
        // const groomingStats = await api.getVendorGroomingStatistics(user.vendorId);
        
        // Mock data for now
        setServiceSummary({
          hotelRooms: 12,
          activeBookings: 5,
          checkedInPets: 3,
          groomingServices: 8,
          upcomingGroomings: 4,
          totalRevenue: 2450.00,
        });
      } catch (error) {
        console.error('Error fetching service summary:', error);
      }
    };

    fetchSummaryData();
  }, [user, router]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <StyledDashboardContainer maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom>
        {t('dashboard.title')}
      </Typography>
      
      <StyledSummaryPaper elevation={1}>
        <Typography variant="h6" gutterBottom>
          {t('dashboard.summary')}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <AnalyticsSummary 
              hotelRooms={serviceSummary.hotelRooms}
              activeBookings={serviceSummary.activeBookings}
              checkedInPets={serviceSummary.checkedInPets}
              groomingServices={serviceSummary.groomingServices}
              upcomingGroomings={serviceSummary.upcomingGroomings}
              totalRevenue={serviceSummary.totalRevenue}
            />
          </Grid>
        </Grid>
      </StyledSummaryPaper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="pet services tabs"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={t('tabs.hotelManagement')} {...a11yProps(0)} />
          <Tab label={t('tabs.groomingManagement')} {...a11yProps(1)} />
          <Tab label={t('tabs.analytics')} {...a11yProps(2)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <PetHotelManagement />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <PetGroomingManagement />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <Box p={3}>
          <Typography variant="h6">{t('analytics.title')}</Typography>
          {/* Detailed analytics components would go here */}
          <Typography variant="body1">{t('analytics.comingSoon')}</Typography>
        </Box>
      </TabPanel>
    </StyledDashboardContainer>
  );
};

export default PetServiceDashboard;
