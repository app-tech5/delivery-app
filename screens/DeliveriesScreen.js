import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions
} from 'react-native';
import { Icon } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';
import { DeliveryCard } from '../components';

// Import shared components and utilities
import {
  ScreenHeader,
  EmptyState,
  FilterButtons,
  AuthGuard
} from '../components';
import { useDeliveryActions } from '../hooks';
import {
  DELIVERY_STATUSES,
  DELIVERY_STATUS_LABELS
} from '../utils';

const { width } = Dimensions.get('window');

export default function DeliveriesScreen() {
  const {
    deliveries,
    isAuthenticated,
    driver,
    updateDeliveryStatus,
    acceptDelivery,
    loadDriverOrders,
    invalidateDeliveriesCache
  } = useDriver();

  const { currency } = useSettings();

  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filtres disponibles
  const filters = [
    { key: 'all', label: i18n.t('common.all'), icon: 'list' },
    { key: DELIVERY_STATUSES.PENDING, label: DELIVERY_STATUS_LABELS[DELIVERY_STATUSES.PENDING], icon: 'clock-outline' },
    { key: DELIVERY_STATUSES.ACCEPTED, label: DELIVERY_STATUS_LABELS[DELIVERY_STATUSES.ACCEPTED], icon: 'check-circle-outline' },
    { key: DELIVERY_STATUSES.OUT_FOR_DELIVERY, label: DELIVERY_STATUS_LABELS[DELIVERY_STATUSES.OUT_FOR_DELIVERY], icon: 'truck-delivery' },
    { key: DELIVERY_STATUSES.DELIVERED, label: DELIVERY_STATUS_LABELS[DELIVERY_STATUSES.DELIVERED], icon: 'check-circle' },
    { key: DELIVERY_STATUSES.CANCELLED, label: DELIVERY_STATUS_LABELS[DELIVERY_STATUSES.CANCELLED], icon: 'close-circle' }
  ];

  // Filtrer les livraisons selon le filtre actif
  const filteredDeliveries = deliveries.filter(delivery => {
    if (activeFilter === 'all') return true;
    return delivery.status === activeFilter;
  });

  // Utiliser le hook pour les actions sur les livraisons
  const { handleAcceptDelivery, handleStartDelivery, handleMarkDelivered } = useDeliveryActions();


  // Gestionnaire de pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await invalidateDeliveriesCache();
      await loadDriverOrders();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      Alert.alert('Error', i18n.t('reports.refreshError'));
    } finally {
      setRefreshing(false);
    }
  };

  // Les gestionnaires d'actions sont maintenant fournis par le hook useDeliveryActions

  return (
    <SafeAreaView style={styles.container}>
      <AuthGuard
        isAuthenticated={isAuthenticated}
        driver={driver}
      />

      {isAuthenticated && driver && (
        <>
          <ScreenHeader
            title={i18n.t('navigation.deliveries')}
            subtitle={`${filteredDeliveries.length} ${filteredDeliveries.length === 1 ? i18n.t('reports.deliverySingular') : i18n.t('reports.deliveryPlural')}`}
          />

          {/* Filtres */}
          <FilterButtons
            filters={filters}
            activeFilter={activeFilter}
            onFilterPress={setActiveFilter}
            iconType="material-community"
          />

          {/* Liste des livraisons */}
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
                  : `Aucune livraison avec le statut "${filters.find(f => f.key === activeFilter)?.label}"`
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
                  />
                ))}
              </View>
            )}
          </ScrollView>
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
  // ScrollView and content
  scrollView: {
    flex: 1,
  },

  // Deliveries list
  deliveriesList: {
    padding: 16,
  },
});