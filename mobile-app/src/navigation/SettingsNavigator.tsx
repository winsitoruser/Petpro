import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import SettingsHomeScreen from '../screens/settings/SettingsHomeScreen';
import AccountProfileScreen from '../screens/settings/AccountProfileScreen';
import BusinessInfoScreen from '../screens/settings/BusinessInfoScreen';
import PaymentSettingsScreen from '../screens/settings/PaymentSettingsScreen';
import TaxSettingsScreen from '../screens/settings/TaxSettingsScreen';
import ShippingSettingsScreen from '../screens/settings/ShippingSettingsScreen';
import NotificationsScreen from '../screens/settings/NotificationsScreen';
import ApiIntegrationScreen from '../screens/settings/ApiIntegrationScreen';
import SubscriptionScreen from '../screens/settings/SubscriptionScreen';

export type SettingsStackParamList = {
  SettingsHome: undefined;
  AccountProfile: undefined;
  BusinessInfo: undefined;
  PaymentSettings: undefined;
  TaxSettings: undefined;
  ShippingSettings: undefined;
  Notifications: undefined;
  ApiIntegration: undefined;
  Subscription: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

const SettingsNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="SettingsHome"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="SettingsHome" component={SettingsHomeScreen} />
      <Stack.Screen name="AccountProfile" component={AccountProfileScreen} />
      <Stack.Screen name="BusinessInfo" component={BusinessInfoScreen} />
      <Stack.Screen name="PaymentSettings" component={PaymentSettingsScreen} />
      <Stack.Screen name="TaxSettings" component={TaxSettingsScreen} />
      <Stack.Screen name="ShippingSettings" component={ShippingSettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="ApiIntegration" component={ApiIntegrationScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
    </Stack.Navigator>
  );
};

export default SettingsNavigator;
