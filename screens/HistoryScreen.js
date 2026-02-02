import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';

// Import shared components and utilities
import {
  ScreenHeader,
  EmptyState,
  FilterButtons,
  StatsGrid,
  AuthGuard,
  DateGroupHeader,
  DeliveryTimelineItem
} from '../components';
import { useDeliveriesGrouping, useHistoryRefresh } from '../hooks';
import {
  TIME_FILTERS,
  mapDeliveryGroupToUI,
  mapHistoryStatsToUI,
  formatCurrency
} from '../utils';

const { width } = Dimensions.get('window');

export default function HistoryScreen() {
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

  const handleViewDetails = (delivery) => {
    navigation.navigate('OrderDetails', { orderId: delivery.rawDelivery._id });
  };

  // Utiliser le hook personnalisé pour le groupement des livraisons
  const { groupedDeliveries, globalStats } = useDeliveriesGrouping(deliveries, activeFilter);

  // Hook pour la logique de refresh
  const { refreshing, onRefresh } = useHistoryRefresh({
    invalidateDeliveriesCache,
    loadDriverOrders
  });

  // Transformer les données pour l'UI
  const uiStats = mapHistoryStatsToUI(globalStats, currency);
  const uiGroups = groupedDeliveries.map(group => mapDeliveryGroupToUI(group, currency));

  return (
    <SafeAreaView style={styles.container}>
      <AuthGuard
        isAuthenticated={isAuthenticated}
        driver={driver}
      />

      <ScreenHeader
        title={i18n.t('reports.historyTitle')}
        subtitle={`${globalStats.periodDeliveries} ${globalStats.periodDeliveries === 1 ? i18n.t('reports.deliverySingular') : i18n.t('reports.deliveryPlural')} • ${formatCurrency(globalStats.periodEarnings, currency)}`}
      />

      {/* Filtres temporels */}
      <FilterButtons
        filters={TIME_FILTERS}
        activeFilter={activeFilter}
        onFilterPress={setActiveFilter}
      />

      {/* Statistiques de la période */}
      <StatsGrid
        stats={[
          {
            value: uiStats.periodDeliveries,
            label: i18n.t('reports.deliveriesLabel')
          },
          {
            value: uiStats.periodEarnings,
            label: i18n.t('reports.earningsLabel')
          },
          {
            value: uiStats.averageEarnings,
            label: i18n.t('reports.averageLabel')
          }
        ]}
      />

      {/* Chronologie des livraisons */}
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
        {groupedDeliveries.length === 0 ? (
          <EmptyState
            icon="history"
            iconType="material"
            title={i18n.t('reports.noHistory')}
            subtitle={activeFilter === 'all'
              ? i18n.t('reports.noDeliveriesYet')
              : i18n.t('reports.noDeliveriesFound')
            }
          />
        ) : (
          <View style={styles.timelineContainer}>
            {uiGroups.map((group, groupIndex) => (
              <View key={group.date.toISOString()}>
                {/* En-tête de groupe (date) */}
                <DateGroupHeader
                  date={group.date}
                  count={group.count}
                  totalEarnings={group.totalEarnings}
                />

                {/* Livraisons du jour */}
                {group.deliveries.map((delivery, deliveryIndex) => (
                  <DeliveryTimelineItem
                    key={delivery.rawDelivery._id}
                    delivery={delivery}
                    isLast={deliveryIndex === group.deliveries.length - 1}
                    currency={currency}
                    onPress={() => handleViewDetails(delivery)}
                  />
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Espace en bas pour le scroll */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
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

  // Timeline
  timelineContainer: {
    paddingHorizontal: 16,
  },

  // Bottom spacer
  bottomSpacer: {
    height: 20,
  },
});
