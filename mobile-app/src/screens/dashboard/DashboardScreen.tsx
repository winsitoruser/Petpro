import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { View, Text } from 'react-native-superflex';
import { useSelector, useDispatch } from 'react-redux';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format, subDays } from 'date-fns';

import { RootState, AppDispatch } from '../../store';
import { useTheme } from '../../context/ThemeContext';
import { fetchSalesData } from '../../store/slices/analyticsSlice';
import { fetchProducts } from '../../store/slices/productsSlice';
import { fetchPromotions } from '../../store/slices/promotionsSlice';
import Card from '../../components/ui/Card';

const DashboardScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const { salesData, loading: analyticsLoading } = useSelector(
    (state: RootState) => state.analytics
  );
  
  const { products, loading: productsLoading } = useSelector(
    (state: RootState) => state.products
  );
  
  const { promotions, loading: promotionsLoading } = useSelector(
    (state: RootState) => state.promotions
  );

  const { vendorProfile } = useSelector(
    (state: RootState) => state.settings
  );

  const isLoading = analyticsLoading || productsLoading || promotionsLoading;

  const today = new Date();
  const startDate = format(subDays(today, 7), 'yyyy-MM-dd');
  const endDate = format(today, 'yyyy-MM-dd');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        dispatch(fetchSalesData({ startDate, endDate, interval: 'day' })),
        dispatch(fetchProducts()),
        dispatch(fetchPromotions()),
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Prepare chart data
  const chartData = {
    labels: salesData.map((item) => {
      const date = new Date(item.period);
      return format(date, 'MM/dd');
    }),
    datasets: [
      {
        data: salesData.map((item) => item.revenue || 0),
        color: () => theme.colors.primary,
      },
    ],
  };

  // Calculate metrics
  const totalRevenue = salesData.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const totalOrders = salesData.reduce((sum, item) => sum + (item.orders || 0), 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  const activeProducts = products.filter(product => product.isActive).length;
  const lowStockProducts = products.filter(product => product.stockQuantity < 5).length;
  
  const activePromotions = promotions.filter(promo => {
    const now = new Date();
    const startDate = new Date(promo.startDate);
    const endDate = new Date(promo.endDate);
    return promo.isActive && startDate <= now && endDate >= now;
  }).length;

  return (
    <View style={styles.container} backgroundColor={theme.colors.background}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Header */}
        <View paddingHorizontal={16} paddingVertical={16}>
          <Text fontSize={24} fontWeight="700" color={theme.colors.text}>
            Welcome back{vendorProfile ? `, ${vendorProfile.businessName}` : ''}!
          </Text>
          <Text fontSize={16} color={theme.colors.textSecondary} marginTop={4}>
            Here's an overview of your business
          </Text>
        </View>

        {isLoading && !refreshing ? (
          <View flex={1} justifyContent="center" alignItems="center" padding={20}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <>
            {/* Revenue Chart */}
            <Card marginHorizontal={16} marginBottom={16}>
              <View flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom={16}>
                <Text fontSize={18} fontWeight="600" color={theme.colors.text}>
                  Weekly Revenue
                </Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('AnalyticsTab' as never, { screen: 'SalesReport' } as never)}
                >
                  <Text color={theme.colors.primary}>See Details</Text>
                </TouchableOpacity>
              </View>
              
              {salesData.length > 0 ? (
                <LineChart
                  data={chartData}
                  width={styles.chart.width}
                  height={180}
                  chartConfig={{
                    backgroundColor: theme.colors.card,
                    backgroundGradientFrom: theme.colors.card,
                    backgroundGradientTo: theme.colors.card,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(${theme.colors.primaryRGB}, ${opacity})`,
                    labelColor: () => theme.colors.text,
                    style: {
                      borderRadius: 16,
                    },
                  }}
                  bezier
                  style={styles.chart}
                />
              ) : (
                <View height={180} justifyContent="center" alignItems="center">
                  <Text color={theme.colors.textSecondary}>No sales data available</Text>
                </View>
              )}
            </Card>

            {/* Key Metrics */}
            <View flexDirection="row" paddingHorizontal={16} marginBottom={16}>
              <Card flex={1} marginRight={8}>
                <View alignItems="center">
                  <Text color={theme.colors.textSecondary} fontSize={14}>
                    Total Revenue
                  </Text>
                  <Text fontSize={20} fontWeight="700" color={theme.colors.text} marginTop={4}>
                    ${totalRevenue.toFixed(2)}
                  </Text>
                </View>
              </Card>
              <Card flex={1} marginLeft={8}>
                <View alignItems="center">
                  <Text color={theme.colors.textSecondary} fontSize={14}>
                    Orders
                  </Text>
                  <Text fontSize={20} fontWeight="700" color={theme.colors.text} marginTop={4}>
                    {totalOrders}
                  </Text>
                </View>
              </Card>
            </View>

            <View flexDirection="row" paddingHorizontal={16} marginBottom={16}>
              <Card flex={1} marginRight={8}>
                <View alignItems="center">
                  <Text color={theme.colors.textSecondary} fontSize={14}>
                    Avg. Order Value
                  </Text>
                  <Text fontSize={20} fontWeight="700" color={theme.colors.text} marginTop={4}>
                    ${averageOrderValue.toFixed(2)}
                  </Text>
                </View>
              </Card>
              <Card flex={1} marginLeft={8}>
                <View alignItems="center">
                  <Text color={theme.colors.textSecondary} fontSize={14}>
                    Active Promotions
                  </Text>
                  <Text fontSize={20} fontWeight="700" color={theme.colors.text} marginTop={4}>
                    {activePromotions}
                  </Text>
                </View>
              </Card>
            </View>

            {/* Quick Actions */}
            <Card marginHorizontal={16} marginBottom={16}>
              <Text fontSize={18} fontWeight="600" color={theme.colors.text} marginBottom={16}>
                Quick Actions
              </Text>
              <View flexDirection="row" flexWrap="wrap" marginHorizontal={-8}>
                {[
                  { 
                    icon: 'add-circle-outline', 
                    label: 'New Product', 
                    onPress: () => navigation.navigate('ProductsTab' as never, { screen: 'AddProduct' } as never),
                    color: theme.colors.success
                  },
                  { 
                    icon: 'pricetag-outline', 
                    label: 'New Promotion', 
                    onPress: () => navigation.navigate('PromotionsTab' as never, { screen: 'CreatePromotion' } as never),
                    color: theme.colors.primary
                  },
                  { 
                    icon: 'stats-chart', 
                    label: 'View Reports', 
                    onPress: () => navigation.navigate('AnalyticsTab' as never),
                    color: theme.colors.info
                  },
                  { 
                    icon: 'settings-outline', 
                    label: 'Settings', 
                    onPress: () => navigation.navigate('More' as never, { screen: 'Settings' } as never),
                    color: theme.colors.textSecondary
                  }
                ].map((action, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.actionButton}
                    onPress={action.onPress}
                  >
                    <View 
                      style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Ionicons name={action.icon as any} size={24} color={action.color} />
                    </View>
                    <Text fontSize={12} color={theme.colors.text} marginTop={4}>
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            {/* Inventory Alert */}
            <Card marginHorizontal={16} marginBottom={16}>
              <View flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom={16}>
                <Text fontSize={18} fontWeight="600" color={theme.colors.text}>
                  Inventory Alert
                </Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('ProductsTab' as never)}
                >
                  <Text color={theme.colors.primary}>View All</Text>
                </TouchableOpacity>
              </View>
              
              <View flexDirection="row" justifyContent="space-between" alignItems="center">
                <View flexDirection="row" alignItems="center">
                  <View 
                    width={40} 
                    height={40} 
                    borderRadius={20} 
                    backgroundColor={`${theme.colors.warning}20`}
                    alignItems="center"
                    justifyContent="center"
                    marginRight={12}
                  >
                    <Ionicons name="alert-circle-outline" size={24} color={theme.colors.warning} />
                  </View>
                  <View>
                    <Text fontWeight="600" color={theme.colors.text}>
                      Low Stock Items
                    </Text>
                    <Text fontSize={14} color={theme.colors.textSecondary}>
                      {lowStockProducts} products need attention
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </View>

              <View 
                height={1} 
                backgroundColor={theme.colors.border} 
                marginVertical={12}
              />

              <View flexDirection="row" justifyContent="space-between" alignItems="center">
                <View flexDirection="row" alignItems="center">
                  <View 
                    width={40} 
                    height={40} 
                    borderRadius={20} 
                    backgroundColor={`${theme.colors.info}20`}
                    alignItems="center"
                    justifyContent="center"
                    marginRight={12}
                  >
                    <Ionicons name="pricetags-outline" size={24} color={theme.colors.info} />
                  </View>
                  <View>
                    <Text fontWeight="600" color={theme.colors.text}>
                      Active Products
                    </Text>
                    <Text fontSize={14} color={theme.colors.textSecondary}>
                      {activeProducts} products listed
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </View>
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chart: {
    width: '100%',
    borderRadius: 16,
    marginVertical: 8,
  },
  actionButton: {
    width: '25%',
    alignItems: 'center',
    padding: 8,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});

export default DashboardScreen;
