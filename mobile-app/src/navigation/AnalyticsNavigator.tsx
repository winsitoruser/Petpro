import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import AnalyticsDashboardScreen from '../screens/analytics/AnalyticsDashboardScreen';
import SalesReportScreen from '../screens/analytics/SalesReportScreen';
import CustomerInsightsScreen from '../screens/analytics/CustomerInsightsScreen';
import InventoryReportScreen from '../screens/analytics/InventoryReportScreen';

export type AnalyticsStackParamList = {
  AnalyticsDashboard: undefined;
  SalesReport: undefined;
  CustomerInsights: undefined;
  InventoryReport: undefined;
};

const Stack = createNativeStackNavigator<AnalyticsStackParamList>();

const AnalyticsNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="AnalyticsDashboard"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="AnalyticsDashboard" component={AnalyticsDashboardScreen} />
      <Stack.Screen name="SalesReport" component={SalesReportScreen} />
      <Stack.Screen name="CustomerInsights" component={CustomerInsightsScreen} />
      <Stack.Screen name="InventoryReport" component={InventoryReportScreen} />
    </Stack.Navigator>
  );
};

export default AnalyticsNavigator;
