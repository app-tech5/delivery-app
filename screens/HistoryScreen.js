import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';

import {
  ScreenLayout,
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
  
  const { groupedDeliveries, globalStats } = useDeliveriesGrouping(deliveries, activeFilter);
  
  const { refreshing, onRefresh } = useHistoryRefresh({
    invalidateDeliveriesCache,
    loadDriverOrders
  });
  
  const uiStats = mapHistoryStatsToUI(globalStats, currency);
  const uiGroups = groupedDeliveries.map(group => mapDeliveryGroupToUI(group, currency));

  return (
    <View style={styles.root}>
      <AuthGuard
        isAuthenticated={isAuthenticated}
        driver={driver}
      />

      <ScreenLayout
        title={i18n.t('reports.historyTitle')}
        subtitle={`${globalStats.periodDeliveries} ${globalStats.periodDeliveries === 1 ? i18n.t('reports.deliverySingular') : i18n.t('reports.deliveryPlural')} • ${formatCurrency(globalStats.periodEarnings, currency)}`}
      >
        <FilterButtons
          filters={TIME_FILTERS}
          activeFilter={activeFilter}
          onFilterPress={setActiveFilter}
        />

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
                {}
                <DateGroupHeader
                  date={group.date}
                  count={group.count}
                  totalEarnings={group.totalEarnings}
                />

                {}
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

        {}
        <View style={styles.bottomSpacer} />
        </ScrollView>
      </ScreenLayout>
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
  
  timelineContainer: {
    paddingHorizontal: 16,
  },
  
  bottomSpacer: {
    height: 20,
  },
});
