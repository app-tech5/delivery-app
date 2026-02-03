import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  RefreshControl
} from 'react-native';
import { Button } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';

// Import shared components and utilities
import {
  ScreenHeader,
  EmptyState,
  AuthGuard,
  Loading
} from '../components';

// Import order detail components
import {
  OrderHeaderCard,
  OrderItemsCard,
  OrderSummaryCard,
  CustomerInfoCard,
  RestaurantInfoCard
} from '../components';

// Import hooks
import { useDeliveryActions } from '../hooks';

// Import API client
import apiClient from '../api';

export default function DeliveryDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params || {};

  const { isAuthenticated, driver } = useDriver();
  const { currency } = useSettings();
  const { handleAcceptDelivery, handleStartDelivery, handleMarkDelivered, handleStatusChange } = useDeliveryActions();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch order details
  const fetchOrderDetails = async (showRefreshIndicator = false) => {
    if (!orderId) {
      setError(i18n.t('common.error'));
      setLoading(false);
      return;
    }

    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      // Fetch order details from API
      const orderData = await apiClient.apiCall(`/resource/orders/${orderId}`);

      if (orderData) {
        setOrder(orderData);
      } else {
        setError(i18n.t('reports.noOrderFound'));
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(i18n.t('common.errorLoadingData'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && driver && orderId) {
      fetchOrderDetails();
    }
  }, [isAuthenticated, driver, orderId]);

  // Handle navigation to customer/restaurant
  const handleNavigate = (address) => {
    if (address) {
      // You can implement navigation to maps here
      Alert.alert(
        i18n.t('orderDetails.navigation'),
        `${i18n.t('orderDetails.navigateTo')}: ${address}`,
        [
          { text: i18n.t('common.cancel'), style: 'cancel' },
          {
            text: i18n.t('common.ok'),
            onPress: () => {
              // Implement actual navigation logic here
              console.log('Navigate to:', address);
            }
          }
        ]
      );
    }
  };

  // Handle refresh
  const onRefresh = () => {
    fetchOrderDetails(true);
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <AuthGuard isAuthenticated={isAuthenticated} driver={driver} />
        <ScreenHeader title={i18n.t('navigation.deliveryDetails')} />
        <Loading />
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <AuthGuard isAuthenticated={isAuthenticated} driver={driver} />
        <ScreenHeader title={i18n.t('navigation.deliveryDetails')} />
        <EmptyState
          icon="error-outline"
          iconType="material"
          title={i18n.t('common.error')}
          subtitle={error}
        />
      </SafeAreaView>
    );
  }

  // No order found
  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <AuthGuard isAuthenticated={isAuthenticated} driver={driver} />
        <ScreenHeader title={i18n.t('navigation.deliveryDetails')} />
        <EmptyState
          icon="package-variant-closed"
          iconType="material-community"
          title={i18n.t('reports.noOrderFound')}
          subtitle={i18n.t('reports.noOrderFoundDesc')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AuthGuard isAuthenticated={isAuthenticated} driver={driver} />

      <ScreenHeader title={i18n.t('navigation.deliveryDetails')} />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.content}>
          {/* Order Header */}
          <OrderHeaderCard order={order} />

          {/* Restaurant Info */}
          <RestaurantInfoCard
            order={order}
            onNavigate={handleNavigate}
          />

          {/* Customer Info */}
          <CustomerInfoCard
            order={order}
            onNavigate={handleNavigate}
          />

          {/* Order Items */}
          <OrderItemsCard order={order} currency={currency} />

          {/* Order Summary */}
          <OrderSummaryCard order={order} currency={currency} />

          {/* Delivery Actions - Only show if order is assigned to current driver */}
          {order.driver === driver?._id && order.status !== 'delivered' && order.status !== 'cancelled' && (
            <View style={styles.actionsContainer}>
              <Text style={styles.actionsTitle}>{i18n.t('orderDetails.deliveryActions')}</Text>

              {order.status === 'pending' && (
                <View style={styles.actionButtons}>
                  <Button
                    title={i18n.t('reports.acceptDelivery')}
                    onPress={() => handleAcceptDelivery(order._id)}
                    buttonStyle={styles.primaryButton}
                    icon={{
                      name: 'check-circle',
                      type: 'material',
                      size: 20,
                      color: colors.white
                    }}
                  />
                </View>
              )}

              {order.status === 'accepted' && (
                <View style={styles.actionButtons}>
                  <Button
                    title={i18n.t('reports.startDelivery')}
                    onPress={() => handleStatusChange(
                      order._id,
                      'out_for_delivery',
                      i18n.t('reports.startDeliveryConfirm')
                    )}
                    buttonStyle={styles.primaryButton}
                    icon={{
                      name: 'truck-delivery',
                      type: 'material-community',
                      size: 20,
                      color: colors.white
                    }}
                  />
                </View>
              )}

              {order.status === 'out_for_delivery' && (
                <View style={styles.actionButtons}>
                  <Button
                    title={i18n.t('reports.completeDelivery')}
                    onPress={() => handleStatusChange(
                      order._id,
                      'delivered',
                      i18n.t('reports.completeDeliveryConfirm')
                    )}
                    buttonStyle={styles.successButton}
                    icon={{
                      name: 'check-circle',
                      type: 'material',
                      size: 20,
                      color: colors.white
                    }}
                  />
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  actionsContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  actionButtons: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
  },
  successButton: {
    backgroundColor: colors.success,
    borderRadius: 8,
    paddingVertical: 12,
  },
});
