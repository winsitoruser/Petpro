import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Tab,
  Tabs,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  SelectChangeEvent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { format, subDays, subMonths } from 'date-fns';

// Import types
import {
  GrowthDataPoint,
  ActivityDataPoint,
  DemographicsData,
  ServiceUsageData,
  RetentionData,
  LineChartData,
  PieChartData,
  BarChartData,
  UserActivity,
  CustomerWithBookings,
} from '../../types/analytics';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// API service for fetching analytics data
import { fetchCustomerGrowth, fetchCustomerActivity, fetchCustomerDemographics, fetchServiceUsage, fetchRetentionMetrics } from '../../services/analyticsService';

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
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `analytics-tab-${index}`,
    'aria-controls': `analytics-tabpanel-${index}`,
  };
}

const CustomerAnalytics: React.FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [timeInterval, setTimeInterval] = useState('day');
  const [startDate, setStartDate] = useState<Date | null>(subMonths(new Date(), 3));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  
  // State for analytics data
  const [growthData, setGrowthData] = useState<GrowthDataPoint[] | null>(null);
  const [activityData, setActivityData] = useState<ActivityDataPoint[] | null>(null);
  const [demographicsData, setDemographicsData] = useState<DemographicsData | null>(null);
  const [serviceUsageData, setServiceUsageData] = useState<ServiceUsageData | null>(null);
  const [retentionData, setRetentionData] = useState<RetentionData | null>(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Fetch all analytics data when filters change
  useEffect(() => {
    const loadData = async () => {
      if (!startDate || !endDate) return;
      
      setIsLoading(true);
      try {
        // Fetch data in parallel
        const [growth, activity, demographics, serviceUsage, retention] = await Promise.all([
          fetchCustomerGrowth(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'), timeInterval),
          fetchCustomerActivity(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'), timeInterval),
          fetchCustomerDemographics(),
          fetchServiceUsage(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')),
          fetchRetentionMetrics(),
        ]);
        
        setGrowthData(growth);
        setActivityData(activity);
        setDemographicsData(demographics);
        setServiceUsageData(serviceUsage);
        setRetentionData(retention);
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [startDate, endDate, timeInterval]);

  // Prepare chart data for customer growth
  const customerGrowthChart = growthData ? {
    labels: growthData.map((item) => {
      // Format based on time interval
      const date = new Date(item.date);
      if (timeInterval === 'day') return format(date, 'MMM dd');
      if (timeInterval === 'week') return `Week ${format(date, 'w')}`;
      return format(date, 'MMM yyyy');
    }),
    datasets: [
      {
        label: t('dashboard.newCustomers'),
        data: growthData.map((item) => item.count),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  } as LineChartData | null : null;

  // Prepare chart data for customer activity
  const customerActivityChart = activityData ? {
    labels: Array.from(
      new Set(activityData.map((item) => {
        const date = new Date(item.date);
        if (timeInterval === 'day') return format(date, 'MMM dd');
        if (timeInterval === 'week') return `Week ${format(date, 'w')}`;
        return format(date, 'MMM yyyy');
      }))
    ),
    datasets: [
      {
        label: t('dashboard.logins'),
        data: activityData
          .filter((item) => item.activity_type === 'login')
          .map((item) => item.count),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: t('dashboard.bookings'),
        data: activityData
          .filter((item) => item.activity_type === 'booking_created')
          .map((item) => item.count),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: t('dashboard.reviews'),
        data: activityData
          .filter((item) => item.activity_type === 'review_submitted')
          .map((item) => item.count),
        borderColor: 'rgb(255, 205, 86)',
        backgroundColor: 'rgba(255, 205, 86, 0.5)',
      },
    ],
  } as LineChartData | null : null;

  // Prepare chart data for pet types
  const petTypesChart = demographicsData?.petTypesData ? {
    labels: demographicsData.petTypesData.map((item) => t(`petTypes.${item.type}`)),
    datasets: [
      {
        data: demographicsData.petTypesData.map((item) => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
          'rgba(199, 199, 199, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
        ],
        borderWidth: 1,
      },
    ],
  } as PieChartData | null : null;

  // Prepare chart data for service bookings by type
  const serviceUsageChart = serviceUsageData?.bookingsByType ? {
    labels: serviceUsageData.bookingsByType.map((item) => t(`serviceTypes.${item.service_type}`)),
    datasets: [
      {
        label: t('dashboard.bookingsByType'),
        data: serviceUsageData.bookingsByType.map((item) => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
      },
    ],
  } as PieChartData | null : null;

  // Prepare chart data for monthly revenue
  const revenueChart = serviceUsageData?.monthlyRevenue ? {
    labels: serviceUsageData.monthlyRevenue.map((item) => format(new Date(item.month), 'MMM yyyy')),
    datasets: [
      {
        label: t('dashboard.monthlyRevenue'),
        data: serviceUsageData.monthlyRevenue.map((item) => parseFloat(item.total_amount)),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
      },
    ],
  } as BarChartData | null : null;

  // Prepare chart data for customer retention
  const retentionChart = retentionData?.retentionByMonth ? {
    labels: retentionData.retentionByMonth.map((item) => format(new Date(item.month), 'MMM yyyy')),
    datasets: [
      {
        label: t('dashboard.retentionRate'),
        data: retentionData.retentionByMonth.map((item) => item.retention_rate),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y',
      },
      {
        label: t('dashboard.totalUsers'),
        data: retentionData.retentionByMonth.map((item) => item.total_users),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y1',
      },
    ],
  } as LineChartData | null : null;

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('dashboard.customerAnalytics')}
      </Typography>

      {/* Filter controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>{t('common.timeInterval')}</InputLabel>
                <Select
                  value={timeInterval}
                  label={t('common.timeInterval')}
                  onChange={(e: SelectChangeEvent) => setTimeInterval(e.target.value)}
                >
                  <MenuItem value="day">{t('timeIntervals.day')}</MenuItem>
                  <MenuItem value="week">{t('timeIntervals.week')}</MenuItem>
                  <MenuItem value="month">{t('timeIntervals.month')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label={t('common.startDate')}
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label={t('common.endDate')}
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="analytics tabs">
              <Tab label={t('dashboard.customerGrowth')} {...a11yProps(0)} />
              <Tab label={t('dashboard.customerActivity')} {...a11yProps(1)} />
              <Tab label={t('dashboard.demographics')} {...a11yProps(2)} />
              <Tab label={t('dashboard.serviceUsage')} {...a11yProps(3)} />
              <Tab label={t('dashboard.retention')} {...a11yProps(4)} />
            </Tabs>
          </Box>

          {/* Customer Growth */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardHeader title={t('dashboard.newCustomersOverTime')} />
                  <CardContent>
                    {customerGrowthChart && (
                      <Box sx={{ height: 400 }}>
                        <Line 
                          data={customerGrowthChart}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: true,
                                title: {
                                  display: true,
                                  text: t('dashboard.numberOfCustomers'),
                                },
                              },
                            },
                          }}
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Customer Activity */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardHeader title={t('dashboard.customerActivityOverTime')} />
                  <CardContent>
                    {customerActivityChart && (
                      <Box sx={{ height: 400 }}>
                        <Line 
                          data={customerActivityChart}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: true,
                                title: {
                                  display: true,
                                  text: t('dashboard.activityCount'),
                                },
                              },
                            },
                          }}
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Demographics */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title={t('dashboard.petTypeDistribution')} />
                  <CardContent>
                    {petTypesChart && (
                      <Box sx={{ height: 300 }}>
                        <Pie 
                          data={petTypesChart}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                          }}
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title={t('dashboard.topActiveUsers')} />
                  <CardContent>
                    {demographicsData?.topActiveUsers && (
                      <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              <th style={{ padding: '8px', textAlign: 'left' }}>{t('common.name')}</th>
                              <th style={{ padding: '8px', textAlign: 'left' }}>{t('common.email')}</th>
                              <th style={{ padding: '8px', textAlign: 'right' }}>{t('dashboard.activityCount')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {demographicsData.topActiveUsers.map((user: UserActivity) => (
                              <tr key={user.userId}>
                                <td style={{ padding: '8px' }}>
                                  {user.user.firstName} {user.user.lastName}
                                </td>
                                <td style={{ padding: '8px' }}>{user.user.email}</td>
                                <td style={{ padding: '8px', textAlign: 'right' }}>{user.activity_count}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Service Usage */}
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title={t('dashboard.bookingsByServiceType')} />
                  <CardContent>
                    {serviceUsageChart && (
                      <Box sx={{ height: 300 }}>
                        <Doughnut 
                          data={serviceUsageChart}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                          }}
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title={t('dashboard.monthlyRevenue')} />
                  <CardContent>
                    {revenueChart && (
                      <Box sx={{ height: 300 }}>
                        <Bar 
                          data={revenueChart}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                          }}
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Retention */}
          <TabPanel value={tabValue} index={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardHeader title={t('dashboard.customerRetention')} />
                  <CardContent>
                    {retentionChart && (
                      <Box sx={{ height: 400 }}>
                        <Line 
                          data={retentionChart}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                type: 'linear',
                                display: true,
                                position: 'left',
                                title: {
                                  display: true,
                                  text: t('dashboard.retentionRatePercent'),
                                },
                                min: 0,
                                max: 100,
                              },
                              y1: {
                                type: 'linear',
                                display: true,
                                position: 'right',
                                title: {
                                  display: true,
                                  text: t('dashboard.userCount'),
                                },
                                min: 0,
                                grid: {
                                  drawOnChartArea: false,
                                },
                              },
                            },
                          }}
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardHeader title={t('dashboard.customersWithRepeatBookings')} />
                  <CardContent>
                    {retentionData?.customersWithMultipleBookings && (
                      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              <th style={{ padding: '8px', textAlign: 'left' }}>{t('common.name')}</th>
                              <th style={{ padding: '8px', textAlign: 'left' }}>{t('common.email')}</th>
                              <th style={{ padding: '8px', textAlign: 'right' }}>{t('dashboard.bookingCount')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {retentionData.customersWithMultipleBookings.map((customer: CustomerWithBookings) => (
                              <tr key={customer.id}>
                                <td style={{ padding: '8px' }}>
                                  {customer.first_name} {customer.last_name}
                                </td>
                                <td style={{ padding: '8px' }}>{customer.email}</td>
                                <td style={{ padding: '8px', textAlign: 'right' }}>
                                  {customer.booking_count}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </>
      )}
    </Box>
  );
};

export default CustomerAnalytics;
