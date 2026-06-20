import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
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

export default function DeliveriesScreen() {
  const navigation = useNavigation();
  const {
    deliveries,
    isAuthenticated,
    driver,
    loadDriverOrders,
    invalidateDeliveriesCache
  } = useDriver();

  const { currency } = useSettings();

  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const handleViewDetails = useCallback((orderId) => {
    navigation.navigate('DeliveryDetails', { orderId });
  }, [navigation]);

  const filters = getDeliveryFilters();

  const deliveryOrders = useMemo(
    () => deliveries.filter((order) => order?.delivery?.type !== 'pickup'),
    [deliveries]
  );

  const filteredDeliveries = useMemo(() => {
    if (activeFilter === 'all') return deliveryOrders;
    return deliveryOrders.filter((delivery) => delivery.status === activeFilter);
  }, [deliveryOrders, activeFilter]);

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

  const renderDelivery = useCallback(({ item: delivery }) => (
    <DeliveryCard
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
  ), [
    handleAcceptDelivery,
    handleStatusChange,
    handleViewDetails,
  ]);

  const emptyComponent = useMemo(() => (
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
  ), [activeFilter, filters]);

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

          <FlatList
            style={styles.list}
            data={filteredDeliveries}
            keyExtractor={(item) => String(item._id)}
            renderItem={renderDelivery}
            ListEmptyComponent={emptyComponent}
            contentContainerStyle={
              filteredDeliveries.length === 0 ? styles.emptyList : styles.deliveriesList
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
              />
            }
            initialNumToRender={6}
            maxToRenderPerBatch={4}
            windowSize={5}
            removeClippedSubviews
          />
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
  list: {
    flex: 1,
  },
  deliveriesList: {
    padding: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
});
