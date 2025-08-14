import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import ProductsListScreen from '../screens/products/ProductsListScreen';
import ProductDetailsScreen from '../screens/products/ProductDetailsScreen';
import AddEditProductScreen from '../screens/products/AddEditProductScreen';
import CategoryManagementScreen from '../screens/products/CategoryManagementScreen';

export type ProductsStackParamList = {
  ProductsList: undefined;
  ProductDetails: { productId: string };
  AddEditProduct: { productId?: string };
  CategoryManagement: undefined;
};

const Stack = createNativeStackNavigator<ProductsStackParamList>();

const ProductsNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="ProductsList"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="ProductsList" component={ProductsListScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <Stack.Screen name="AddEditProduct" component={AddEditProductScreen} />
      <Stack.Screen name="CategoryManagement" component={CategoryManagementScreen} />
    </Stack.Navigator>
  );
};

export default ProductsNavigator;
