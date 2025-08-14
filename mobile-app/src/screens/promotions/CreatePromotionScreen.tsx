import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { View, Text } from 'react-native-superflex';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import { RootState, AppDispatch } from '../../store';
import { createPromotion, NewPromotion } from '../../store/slices/promotionsSlice';
import { fetchProducts } from '../../store/slices/productsSlice';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/ui/Button';
import TextField from '../../components/ui/TextField';
import SegmentedControl from '../../components/ui/SegmentedControl';
import Checkbox from '../../components/ui/Checkbox';
import Card from '../../components/ui/Card';
import { format } from 'date-fns';

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  discountType: Yup.string().oneOf(['percentage', 'fixed'], 'Invalid discount type'),
  discountValue: Yup.number()
    .required('Discount value is required')
    .positive('Discount must be positive')
    .when('discountType', {
      is: 'percentage',
      then: (schema) => schema.max(100, 'Percentage cannot exceed 100%'),
      otherwise: (schema) => schema.min(0.01, 'Discount amount must be at least 0.01'),
    }),
  startDate: Yup.date().required('Start date is required'),
  endDate: Yup.date()
    .required('End date is required')
    .min(
      Yup.ref('startDate'),
      'End date must be after start date'
    ),
  minPurchaseAmount: Yup.number().nullable().min(0, 'Minimum purchase amount cannot be negative'),
  maxDiscountAmount: Yup.number().nullable().min(0, 'Maximum discount amount cannot be negative'),
  usageLimit: Yup.number().nullable().integer('Must be a whole number').min(1, 'Must be at least 1'),
  applicableTo: Yup.string().oneOf(['all', 'specific'], 'Invalid selection'),
});

const CreatePromotionScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { theme } = useTheme();

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const { loading } = useSelector((state: RootState) => state.promotions);
  const { products } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, []);

  const initialValues: NewPromotion = {
    title: '',
    description: '',
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    isActive: true,
    minPurchaseAmount: null,
    maxDiscountAmount: null,
    usageLimit: null,
    applicableTo: 'all',
    productIds: [],
  };

  const handleCreatePromotion = async (values: NewPromotion) => {
    try {
      const promotionData = {
        ...values,
        productIds: values.applicableTo === 'specific' ? selectedProducts : [],
      };
      
      await dispatch(createPromotion(promotionData)).unwrap();
      Alert.alert('Success', 'Promotion created successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create promotion');
    }
  };

  const toggleProductSelection = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container} backgroundColor={theme.colors.background}>
        {/* Header */}
        <View
          flexDirection="row"
          alignItems="center"
          paddingHorizontal={16}
          paddingVertical={12}
          backgroundColor={theme.colors.card}
          elevation={2}
          shadowColor={theme.colors.shadow}
          shadowOpacity={0.1}
          shadowRadius={3}
          shadowOffset={{ width: 0, height: 2 }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text fontSize={16} color={theme.colors.primary}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text fontSize={18} fontWeight="600" color={theme.colors.text} flex={1} textAlign="center">
            Create Promotion
          </Text>
          <View style={styles.backButton} />
        </View>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleCreatePromotion}
        >
          {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
            <>
              <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Basic Information Card */}
                <Card marginBottom={16}>
                  <Text fontSize={18} fontWeight="600" color={theme.colors.text} marginBottom={16}>
                    Basic Information
                  </Text>
                  
                  <TextField
                    label="Promotion Title"
                    value={values.title}
                    onChangeText={handleChange('title')}
                    onBlur={handleBlur('title')}
                    error={touched.title && errors.title ? errors.title : undefined}
                    placeholder="e.g. Summer Sale"
                    maxLength={50}
                  />
                  
                  <TextField
                    label="Description"
                    value={values.description}
                    onChangeText={handleChange('description')}
                    onBlur={handleBlur('description')}
                    error={touched.description && errors.description ? errors.description : undefined}
                    placeholder="Describe your promotion"
                    multiline
                    numberOfLines={3}
                    maxLength={200}
                  />
                  
                  <TextField
                    label="Promo Code (optional)"
                    value={values.code}
                    onChangeText={(text) => setFieldValue('code', text.toUpperCase())}
                    onBlur={handleBlur('code')}
                    error={touched.code && errors.code ? errors.code : undefined}
                    placeholder="e.g. SUMMER2023"
                    maxLength={20}
                    autoCapitalize="characters"
                  />
                </Card>
                
                {/* Discount Settings Card */}
                <Card marginBottom={16}>
                  <Text fontSize={18} fontWeight="600" color={theme.colors.text} marginBottom={16}>
                    Discount Settings
                  </Text>
                  
                  <Text fontSize={14} color={theme.colors.text} marginBottom={8}>
                    Discount Type
                  </Text>
                  <SegmentedControl
                    values={['Percentage', 'Fixed Amount']}
                    selectedIndex={values.discountType === 'percentage' ? 0 : 1}
                    onChange={(index) => {
                      setFieldValue('discountType', index === 0 ? 'percentage' : 'fixed');
                    }}
                    marginBottom={16}
                  />
                  
                  <TextField
                    label={values.discountType === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount ($)'}
                    value={values.discountValue.toString()}
                    onChangeText={(text) => {
                      const value = parseFloat(text);
                      setFieldValue('discountValue', isNaN(value) ? 0 : value);
                    }}
                    onBlur={handleBlur('discountValue')}
                    error={touched.discountValue && errors.discountValue ? errors.discountValue : undefined}
                    keyboardType="numeric"
                  />
                </Card>
                
                {/* Date Settings Card */}
                <Card marginBottom={16}>
                  <Text fontSize={18} fontWeight="600" color={theme.colors.text} marginBottom={16}>
                    Date Settings
                  </Text>
                  
                  <View marginBottom={16}>
                    <Text fontSize={14} color={theme.colors.text} marginBottom={8}>
                      Start Date
                    </Text>
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => setShowStartDatePicker(true)}
                    >
                      <Text color={theme.colors.text}>
                        {format(values.startDate, 'MMM dd, yyyy')}
                      </Text>
                    </TouchableOpacity>
                    {touched.startDate && errors.startDate && (
                      <Text fontSize={12} color={theme.colors.error} marginTop={4}>
                        {errors.startDate}
                      </Text>
                    )}
                    
                    <DateTimePickerModal
                      isVisible={showStartDatePicker}
                      mode="date"
                      onConfirm={(date) => {
                        setFieldValue('startDate', date);
                        setShowStartDatePicker(false);
                      }}
                      onCancel={() => setShowStartDatePicker(false)}
                      date={values.startDate}
                    />
                  </View>
                  
                  <View marginBottom={16}>
                    <Text fontSize={14} color={theme.colors.text} marginBottom={8}>
                      End Date
                    </Text>
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => setShowEndDatePicker(true)}
                    >
                      <Text color={theme.colors.text}>
                        {format(values.endDate, 'MMM dd, yyyy')}
                      </Text>
                    </TouchableOpacity>
                    {touched.endDate && errors.endDate && (
                      <Text fontSize={12} color={theme.colors.error} marginTop={4}>
                        {errors.endDate}
                      </Text>
                    )}
                    
                    <DateTimePickerModal
                      isVisible={showEndDatePicker}
                      mode="date"
                      onConfirm={(date) => {
                        setFieldValue('endDate', date);
                        setShowEndDatePicker(false);
                      }}
                      onCancel={() => setShowEndDatePicker(false)}
                      date={values.endDate}
                      minimumDate={values.startDate}
                    />
                  </View>
                  
                  <View flexDirection="row" alignItems="center">
                    <Checkbox
                      checked={values.isActive}
                      onToggle={(checked) => setFieldValue('isActive', checked)}
                    />
                    <Text color={theme.colors.text} marginLeft={8}>
                      Active
                    </Text>
                  </View>
                </Card>
                
                {/* Advanced Settings Card */}
                <Card marginBottom={16}>
                  <Text fontSize={18} fontWeight="600" color={theme.colors.text} marginBottom={16}>
                    Advanced Settings
                  </Text>
                  
                  <TextField
                    label="Minimum Purchase Amount ($, optional)"
                    value={values.minPurchaseAmount !== null ? values.minPurchaseAmount.toString() : ''}
                    onChangeText={(text) => {
                      const value = text === '' ? null : parseFloat(text);
                      setFieldValue('minPurchaseAmount', value);
                    }}
                    onBlur={handleBlur('minPurchaseAmount')}
                    error={touched.minPurchaseAmount && errors.minPurchaseAmount ? errors.minPurchaseAmount : undefined}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                  
                  {values.discountType === 'percentage' && (
                    <TextField
                      label="Maximum Discount Amount ($, optional)"
                      value={values.maxDiscountAmount !== null ? values.maxDiscountAmount.toString() : ''}
                      onChangeText={(text) => {
                        const value = text === '' ? null : parseFloat(text);
                        setFieldValue('maxDiscountAmount', value);
                      }}
                      onBlur={handleBlur('maxDiscountAmount')}
                      error={touched.maxDiscountAmount && errors.maxDiscountAmount ? errors.maxDiscountAmount : undefined}
                      keyboardType="numeric"
                      placeholder="No limit"
                    />
                  )}
                  
                  <TextField
                    label="Usage Limit per Customer (optional)"
                    value={values.usageLimit !== null ? values.usageLimit.toString() : ''}
                    onChangeText={(text) => {
                      const value = text === '' ? null : parseInt(text, 10);
                      setFieldValue('usageLimit', value);
                    }}
                    onBlur={handleBlur('usageLimit')}
                    error={touched.usageLimit && errors.usageLimit ? errors.usageLimit : undefined}
                    keyboardType="numeric"
                    placeholder="Unlimited"
                  />
                </Card>
                
                {/* Product Applicability Card */}
                <Card marginBottom={20}>
                  <Text fontSize={18} fontWeight="600" color={theme.colors.text} marginBottom={16}>
                    Apply To
                  </Text>
                  
                  <SegmentedControl
                    values={['All Products', 'Specific Products']}
                    selectedIndex={values.applicableTo === 'all' ? 0 : 1}
                    onChange={(index) => {
                      setFieldValue('applicableTo', index === 0 ? 'all' : 'specific');
                    }}
                    marginBottom={16}
                  />
                  
                  {values.applicableTo === 'specific' && (
                    <View>
                      <Text fontSize={14} color={theme.colors.text} marginBottom={8}>
                        Select Products
                      </Text>
                      
                      {products.length === 0 ? (
                        <Text color={theme.colors.textSecondary}>No products available</Text>
                      ) : (
                        products.map((product) => (
                          <View 
                            key={product.id}
                            flexDirection="row"
                            alignItems="center"
                            paddingVertical={8}
                            borderBottomWidth={1}
                            borderBottomColor={theme.colors.border}
                          >
                            <Checkbox
                              checked={selectedProducts.includes(product.id)}
                              onToggle={() => toggleProductSelection(product.id)}
                            />
                            <Text marginLeft={8} color={theme.colors.text}>
                              {product.name}
                            </Text>
                          </View>
                        ))
                      )}
                    </View>
                  )}
                </Card>
              </ScrollView>
              
              <View 
                paddingHorizontal={16}
                paddingVertical={12}
                backgroundColor={theme.colors.card}
                borderTopWidth={1}
                borderTopColor={theme.colors.border}
              >
                <Button
                  title="Create Promotion"
                  onPress={handleSubmit as any}
                  variant="primary"
                  size="large"
                  loading={loading}
                  disabled={loading}
                />
              </View>
            </>
          )}
        </Formik>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  backButton: {
    width: 60,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
  },
});

export default CreatePromotionScreen;
