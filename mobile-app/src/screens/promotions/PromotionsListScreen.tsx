import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { View, Text } from 'react-native-superflex';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { RootState, AppDispatch } from '../../store';
import { fetchPromotions, deletePromotion, Promotion } from '../../store/slices/promotionsSlice';
import { useTheme } from '../../context/ThemeContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const PromotionsListScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const { promotions, loading, error } = useSelector(
    (state: RootState) => state.promotions
  );

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      await dispatch(fetchPromotions()).unwrap();
    } catch (error) {
      console.error('Failed to load promotions:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPromotions();
    setRefreshing(false);
  };

  const handleCreatePromotion = () => {
    navigation.navigate('CreatePromotion' as never);
  };

  const handleDeletePromotion = (id: string) => {
    Alert.alert(
      'Delete Promotion',
      'Are you sure you want to delete this promotion? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deletePromotion(id)).unwrap();
              Alert.alert('Success', 'Promotion deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete promotion');
            }
          },
        },
      ]
    );
  };

  const getPromotionStatus = (promotion: Promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    if (!promotion.isActive) {
      return { status: 'Inactive', color: theme.colors.textSecondary };
    }
    if (now < startDate) {
      return { status: 'Scheduled', color: theme.colors.info };
    }
    if (now > endDate) {
      return { status: 'Expired', color: theme.colors.error };
    }
    return { status: 'Active', color: theme.colors.success };
  };

  const renderItem = ({ item }: { item: Promotion }) => {
    const promotionStatus = getPromotionStatus(item);
    const startDate = format(new Date(item.startDate), 'MMM dd, yyyy');
    const endDate = format(new Date(item.endDate), 'MMM dd, yyyy');

    return (
      <Card marginBottom={12}>
        <TouchableOpacity
          onPress={() => navigation.navigate('PromotionDetails' as never, { id: item.id } as never)}
        >
          <View>
            {/* Header with title and status */}
            <View flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom={8}>
              <Text fontSize={18} fontWeight="600" color={theme.colors.text} numberOfLines={1} flex={1}>
                {item.title}
              </Text>
              <View 
                paddingHorizontal={8} 
                paddingVertical={4} 
                backgroundColor={`${promotionStatus.color}20`} 
                borderRadius={4}
              >
                <Text color={promotionStatus.color} fontSize={12} fontWeight="500">
                  {promotionStatus.status}
                </Text>
              </View>
            </View>
            
            {/* Discount info */}
            <Text fontSize={16} color={theme.colors.text} fontWeight="600" marginBottom={4}>
              {item.discountType === 'percentage' ? `${item.discountValue}% off` : `$${item.discountValue} off`}
            </Text>
            
            {/* Date range */}
            <View flexDirection="row" alignItems="center" marginBottom={8}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
              <Text fontSize={14} color={theme.colors.textSecondary} marginLeft={4}>
                {startDate} - {endDate}
              </Text>
            </View>
            
            {/* Description */}
            <Text fontSize={14} color={theme.colors.text} numberOfLines={2} marginBottom={12}>
              {item.description}
            </Text>
            
            {/* Action buttons */}
            <View flexDirection="row" justifyContent="flex-end">
              <Button
                title="Edit"
                onPress={() => navigation.navigate('EditPromotion' as never, { id: item.id } as never)}
                variant="secondary"
                size="small"
                leftIcon="pencil"
                style={{ marginRight: 8 }}
              />
              <Button
                title="Delete"
                onPress={() => handleDeletePromotion(item.id)}
                variant="danger"
                size="small"
                leftIcon="trash"
              />
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <View style={styles.container} backgroundColor={theme.colors.background}>
      {/* Header with title and create button */}
      <View 
        flexDirection="row" 
        justifyContent="space-between" 
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
        <Text fontSize={20} fontWeight="700" color={theme.colors.text}>
          Promotions
        </Text>
        <Button 
          title="Create" 
          onPress={handleCreatePromotion} 
          variant="primary" 
          size="small" 
          leftIcon="add"
        />
      </View>

      {/* Content */}
      {loading && !refreshing ? (
        <View flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <>
          {promotions.length > 0 ? (
            <FlatList
              data={promotions}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View flex={1} justifyContent="center" alignItems="center" padding={20}>
              <View 
                width={80} 
                height={80} 
                borderRadius={40} 
                backgroundColor={`${theme.colors.primary}20`}
                alignItems="center"
                justifyContent="center"
                marginBottom={16}
              >
                <Ionicons name="pricetag-outline" size={40} color={theme.colors.primary} />
              </View>
              <Text fontSize={18} fontWeight="600" color={theme.colors.text} marginBottom={8}>
                No Promotions Yet
              </Text>
              <Text textAlign="center" color={theme.colors.textSecondary} marginBottom={20}>
                Create promotions to attract customers and increase sales
              </Text>
              <Button
                title="Create First Promotion"
                onPress={handleCreatePromotion}
                variant="primary"
                leftIcon="add"
              />
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
});

export default PromotionsListScreen;
