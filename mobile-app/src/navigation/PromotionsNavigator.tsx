import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import PromotionsListScreen from '../screens/promotions/PromotionsListScreen';
import CreatePromotionScreen from '../screens/promotions/CreatePromotionScreen';
import PromotionDetailsScreen from '../screens/promotions/PromotionDetailsScreen';

export type PromotionsStackParamList = {
  PromotionsList: undefined;
  PromotionDetails: { promotionId: string };
  CreatePromotion: { promotionId?: string };
};

const Stack = createNativeStackNavigator<PromotionsStackParamList>();

const PromotionsNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="PromotionsList"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="PromotionsList" component={PromotionsListScreen} />
      <Stack.Screen name="PromotionDetails" component={PromotionDetailsScreen} />
      <Stack.Screen name="CreatePromotion" component={CreatePromotionScreen} />
    </Stack.Navigator>
  );
};

export default PromotionsNavigator;
