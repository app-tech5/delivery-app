import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';
import { DeliveryCard } from '../components';

import {
  ScreenLayout,
  EmptyState,
  FilterButtons,
  AuthGuard
} from '../components';
import { useDeliveryActions } from '../hooks';
import { getDeliveryFilters } from '../utils/deliveryFilters';
import { OrdersContext } from '../contexts/OrdersContext';

export default function DeliveriesScreen() {
  const navigation = useNavigation();
  const {
    deliveries,
    isAuthenticated,
    driver,
    loadDriverOrders,
    invalidateDeliveriesCache
  } = useDriver();

  const { orders, setOrders } = useContext(OrdersContext);

  const { currency } = useSettings();

  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const handleViewDetails = (orderId) => {
    navigation.navigate('DeliveryDetails', { orderId });
  };

  const filters = getDeliveryFilters();

  const deliveryOrders = orders.filter(
    (order) => order?.delivery?.type !== 'pickup'
  );

  const filteredDeliveries = deliveryOrders.filter((delivery) => {
    if (activeFilter === 'all') return true;
    return delivery.status === activeFilter;
  });

  useEffect(() => {
    if (deliveries.length > 0) {
      setOrders(deliveries);
    }
  }, [deliveries, setOrders]);
  
  const { handleAcceptDelivery, handleStartDelivery, handleMarkDelivered, handleStatusChange } = useDeliveryActions();
  
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await invalidateDeliveriesCache();
      await loadDriverOrders();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      Alert.alert(i18n.t('common.error'), i18n.t('reports.refreshError'));
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.root}>
      <AuthGuard
        isAuthenticated={isAuthenticated}
        driver={driver}
      />

      {isAuthenticated && driver && (
        <ScreenLayout
          testID="deliveries-screen"
          title={i18n.t('navigation.deliveries')}
          subtitle={`${deliveryOrders.length} ${deliveryOrders.length === 1 ? i18n.t('reports.deliverySingular') : i18n.t('reports.deliveryPlural')}`}
        >
          <FilterButtons
            filters={filters}
            activeFilter={activeFilter}
            onFilterPress={setActiveFilter}
            iconType="material-community"
          />

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
            {filteredDeliveries.length === 0 ? (
              <EmptyState
                icon="package-variant-closed"
                iconType="material-community"
                title={activeFilter === 'all' ? i18n.t('reports.noDeliveries') : i18n.t('reports.noDeliveriesFiltered')}
                subtitle={activeFilter === 'all'
                  ? i18n.t('reports.noDeliveriesAtAll')
                  : i18n.t('reports.noDeliveriesWithStatus', {
                    status: filters.find((filter) => filter.key === activeFilter)?.label,
                  })
                }
              />
            ) : (
              <View style={styles.deliveriesList}>
                {filteredDeliveries.map((delivery) => (
                  <DeliveryCard
                    key={delivery._id}
                    delivery={delivery}
                    onAccept={handleAcceptDelivery}
                    onStartDelivery={(id) => handleStatusChange(
                      id,
                      'out_for_delivery',
                      i18n.t('reports.startDeliveryConfirm')
                    )}
                    onMarkDelivered={(id) => handleStatusChange(
                      id,
                      'delivered',
                      i18n.t('reports.completeDeliveryConfirm')
                    )}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        </ScreenLayout>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  deliveriesList: {
    padding: 16,
  },
});
