import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Import screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import ProductsNavigator from './ProductsNavigator';
import PromotionsNavigator from './PromotionsNavigator';
import SettingsNavigator from './SettingsNavigator';
import AnalyticsNavigator from './AnalyticsNavigator';

export type MainTabParamList = {
  Dashboard: undefined;
  Products: undefined;
  Promotions: undefined;
  Analytics: undefined;
  More: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator();

const MoreNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SettingsMain" component={SettingsNavigator} />
    </Stack.Navigator>
  );
};

const MainNavigator = () => {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.inactive,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'ios-home';
          
          if (route.name === 'Dashboard') {
            iconName = focused ? 'ios-home' : 'ios-home-outline';
          } else if (route.name === 'Products') {
            iconName = focused ? 'ios-pricetag' : 'ios-pricetag-outline';
          } else if (route.name === 'Promotions') {
            iconName = focused ? 'ios-megaphone' : 'ios-megaphone-outline';
          } else if (route.name === 'Analytics') {
            iconName = focused ? 'ios-bar-chart' : 'ios-bar-chart-outline';
          } else if (route.name === 'More') {
            iconName = focused ? 'ios-menu' : 'ios-menu-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Products" component={ProductsNavigator} />
      <Tab.Screen name="Promotions" component={PromotionsNavigator} />
      <Tab.Screen name="Analytics" component={AnalyticsNavigator} />
      <Tab.Screen name="More" component={MoreNavigator} />
    </Tab.Navigator>
  );
};

export default MainNavigator;
