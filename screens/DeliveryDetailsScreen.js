import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
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

import {
  ScreenLayout,
  EmptyState,
  AuthGuard,
  Loading
} from '../components';

import {
  OrderHeaderCard,
  OrderItemsCard,
  OrderSummaryCard,
  CustomerInfoCard,
  RestaurantInfoCard,
  DriverInfoCard
} from '../components';

import { useDeliveryActions } from '../hooks';

export default function DeliveryDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params || {};

  const {
    isAuthenticated,
    driver,
    deliveries,
    loadDriverOrders,
  } = useDriver();
  const { currency } = useSettings();
  const { handleAcceptDelivery, handleStartDelivery, handleMarkDelivered, handleStatusChange } = useDeliveryActions();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setError(i18n.t('common.error'));
      setLoading(false);
      return;
    }

    const foundOrder = deliveries.find((delivery) => delivery._id === orderId);
    if (foundOrder) {
      setOrder(foundOrder);
      setError(null);
      setLoading(false);
    }
  }, [deliveries, orderId]);

  const loadOrderDetails = async (showRefreshIndicator = false) => {
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

      const cachedOrder = deliveries.find((delivery) => delivery._id === orderId);
      if (cachedOrder) {
        setOrder(cachedOrder);
        return;
      }

      await loadDriverOrders();
    } catch (err) {
      console.error('Error loading order details:', err);
      setError(i18n.t('common.errorLoadingData'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !driver || !orderId) {
      return;
    }

    const foundOrder = deliveries.find((delivery) => delivery._id === orderId);
    if (foundOrder) {
      return;
    }

    loadOrderDetails();
  }, [isAuthenticated, driver, orderId]);

  useEffect(() => {
    if (!orderId || loading || order) {
      return;
    }

    const foundOrder = deliveries.find((delivery) => delivery._id === orderId);
    if (!foundOrder) {
      setError(i18n.t('reports.noOrderFound'));
    }
  }, [deliveries, orderId, loading, order]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDriverOrders();
    } catch (err) {
      console.error('Error refreshing order details:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const deliveryTitle = i18n.t('navigation.deliveryDetails');
  
  if (loading) {
    return (
      <>
        <AuthGuard isAuthenticated={isAuthenticated} driver={driver} />
        <ScreenLayout title={deliveryTitle}>
          <Loading />
        </ScreenLayout>
      </>
    );
  }
  
  if (error) {
    return (
      <>
        <AuthGuard isAuthenticated={isAuthenticated} driver={driver} />
        <ScreenLayout title={deliveryTitle}>
          <EmptyState
            icon="error-outline"
            iconType="material"
            title={i18n.t('common.error')}
            subtitle={error}
          />
        </ScreenLayout>
      </>
    );
  }
  
  if (!order) {
    return (
      <>
        <AuthGuard isAuthenticated={isAuthenticated} driver={driver} />
        <ScreenLayout title={deliveryTitle}>
          <EmptyState
            icon="package-variant-closed"
            iconType="material-community"
            title={i18n.t('reports.noOrderFound')}
            subtitle={i18n.t('reports.noOrderFoundDesc')}
          />
        </ScreenLayout>
      </>
    );
  }

  return (
    <>
      <AuthGuard isAuthenticated={isAuthenticated} driver={driver} />

      <ScreenLayout title={deliveryTitle}>
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
          {}
          <OrderHeaderCard order={order} />

          {}
          <RestaurantInfoCard
            order={order}
          />

          <DriverInfoCard order={order} />

          {}
          <CustomerInfoCard
            order={order}
          />

          {}
          <OrderItemsCard order={order} currency={currency} />

          {}
          <OrderSummaryCard order={order} currency={currency} />

          {}
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
      </ScreenLayout>
    </>
  );
}

const styles = StyleSheet.create({
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
