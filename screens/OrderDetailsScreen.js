import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Linking,
  Dimensions
} from 'react-native';
import { Button } from 'react-native-elements';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';

// Import shared components and utilities
import {
  ScreenHeader,
  AuthGuard,
  LoadingOverlay,
  OrderHeaderCard,
  CustomerInfoCard,
  RestaurantInfoCard,
  OrderItemsCard,
  OrderSummaryCard,
  OrderActionButtons
} from '../components';
import { useDeliveryActions } from '../hooks';

const { width } = Dimensions.get('window');

export default function OrderDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = route.params || {};

  const {
    deliveries,
    isAuthenticated,
    driver,
    loadDriverOrders
  } = useDriver();

  const { currency } = useSettings();
  const { markAsDelivered } = useDeliveryActions();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Find order in deliveries or fetch from API
      const foundOrder = deliveries.find(d => d._id === orderId);

      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        // If not found in local deliveries, try to load from API
        await loadDriverOrders();
        const refreshedOrder = deliveries.find(d => d._id === orderId);
        if (refreshedOrder) {
          setOrder(refreshedOrder);
        } else {
          setError(i18n.t('orderDetails.orderNotFound'));
        }
      }
    } catch (err) {
      console.error('Error loading order details:', err);
      setError(i18n.t('orderDetails.errorLoadingOrder'));
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (address) => {
    if (address) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Maps navigation is not available');
        }
      });
    }
  };

  const handleMarkAsDelivered = async () => {
    Alert.alert(
      i18n.t('reports.completeDeliveryConfirm'),
      '',
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('common.confirm'),
          onPress: async () => {
            try {
              await markAsDelivered(order._id);
              // Reload order details
              await loadOrderDetails();
            } catch (error) {
              Alert.alert('Error', i18n.t('reports.updateError'));
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AuthGuard
        isAuthenticated={isAuthenticated}
        driver={driver}
      />

      {isAuthenticated && driver && (
        <>
          <ScreenHeader title={i18n.t('orderDetails.title')} />

          {loading ? (
            <LoadingOverlay message={i18n.t('orderDetails.loadingOrder')} />
          ) : error || !order ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error || i18n.t('orderDetails.orderNotFound')}</Text>
              <Button
                title={i18n.t('common.retry')}
                onPress={loadOrderDetails}
                buttonStyle={styles.retryButton}
              />
            </View>
          ) : (
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <OrderHeaderCard order={order} />
              <CustomerInfoCard order={order} onNavigate={handleNavigate} />
              <RestaurantInfoCard order={order} onNavigate={handleNavigate} />
              <OrderItemsCard order={order} currency={currency} />
              <OrderSummaryCard order={order} currency={currency} />
              <OrderActionButtons order={order} onMarkAsDelivered={handleMarkAsDelivered} />

              <View style={styles.bottomSpacer} />
            </ScrollView>
          )}
        </>
      )}
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
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  bottomSpacer: {
    height: 20,
  },
});
