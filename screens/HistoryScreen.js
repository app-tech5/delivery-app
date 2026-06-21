import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SectionList,
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

export default function HistoryScreen() {
  const navigation = useNavigation();
  const {
    deliveries,
    isAuthenticated,
    driver,
    hasCompletedOnboarding,
    loadDriverOrders,
    invalidateDeliveriesCache
  } = useDriver();

  const { currency } = useSettings();

  const [activeFilter, setActiveFilter] = useState('all');

  const handleViewDetails = useCallback((delivery) => {
    navigation.navigate('OrderDetails', { orderId: delivery.rawDelivery._id });
  }, [navigation]);

  const { groupedDeliveries, globalStats } = useDeliveriesGrouping(deliveries, activeFilter);

  const { refreshing, onRefresh } = useHistoryRefresh({
    invalidateDeliveriesCache,
    loadDriverOrders
  });

  const uiStats = useMemo(
    () => mapHistoryStatsToUI(globalStats, currency),
    [globalStats, currency]
  );

  const sections = useMemo(() => {
    return groupedDeliveries.map((group) => {
      const uiGroup = mapDeliveryGroupToUI(group, currency);
      return {
        key: uiGroup.date.toISOString(),
        date: uiGroup.date,
        count: uiGroup.count,
        totalEarnings: uiGroup.totalEarnings,
        data: uiGroup.deliveries.map((delivery, index) => ({
          ...delivery,
          isLast: index === uiGroup.deliveries.length - 1,
        })),
      };
    });
  }, [groupedDeliveries, currency]);

  const renderSectionHeader = useCallback(({ section }) => (
    <DateGroupHeader
      date={section.date}
      count={section.count}
      totalEarnings={section.totalEarnings}
    />
  ), []);

  const renderItem = useCallback(({ item: delivery }) => (
    <View style={styles.itemContainer}>
      <DeliveryTimelineItem
        delivery={delivery}
        isLast={delivery.isLast}
        currency={currency}
        onPress={() => handleViewDetails(delivery)}
      />
    </View>
  ), [currency, handleViewDetails]);

  const emptyComponent = useMemo(() => (
    <EmptyState
      icon="history"
      iconType="material"
      title={i18n.t('reports.noHistory')}
      subtitle={activeFilter === 'all'
        ? i18n.t('reports.noDeliveriesYet')
        : i18n.t('reports.noDeliveriesFound')
      }
    />
  ), [activeFilter]);

  return (
    <View style={styles.root}>
      <AuthGuard
        isAuthenticated={isAuthenticated}
        driver={driver}
      />

      {hasCompletedOnboarding && driver && (
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

          <SectionList
            style={styles.list}
            sections={sections}
            keyExtractor={(item) => String(item.rawDelivery._id)}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            ListEmptyComponent={emptyComponent}
            contentContainerStyle={sections.length === 0 ? styles.emptyList : styles.timelineContainer}
            stickySectionHeadersEnabled={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
              />
            }
            initialNumToRender={8}
            maxToRenderPerBatch={6}
            windowSize={5}
            removeClippedSubviews
            ListFooterComponent={<View style={styles.bottomSpacer} />}
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
  emptyList: {
    flexGrow: 1,
  },
  timelineContainer: {
    paddingHorizontal: 16,
  },
  itemContainer: {
    width: '100%',
  },
  bottomSpacer: {
    height: 20,
  },
});
