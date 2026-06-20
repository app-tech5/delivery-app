import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';
import { useRecentDeliveries, useEarningsRefresh } from '../hooks';

import {
  AuthGuard,
  ScreenLayout,
  RatingStats
} from '../components';

export default function RatingScreen() {
  const navigation = useNavigation();
  const {
    stats,
    loadDriverOrders,
    invalidateDeliveriesCache,
    deliveries,
    isAuthenticated,
    driver,
    hasCompletedOnboarding,
  } = useDriver();

  const { currency } = useSettings();

  const recentDeliveries = useRecentDeliveries(deliveries, { days: 30, limit: 10, status: 'delivered' });
  const { refreshing, onRefresh } = useEarningsRefresh({
    invalidateDeliveriesCache,
    loadDriverOrders,
  });

  const displayedDeliveries = useMemo(
    () => recentDeliveries.slice(0, 5),
    [recentDeliveries]
  );

  const renderDelivery = useCallback(({ item: delivery }) => (
    <View style={styles.deliveryItem}>
      <View style={styles.deliveryInfo}>
        <Text style={styles.deliveryId}>#{delivery._id.slice(-6)}</Text>
        <Text style={styles.deliveryDate}>
          {new Date(delivery.createdAt).toLocaleDateString(i18n.locale)}
        </Text>
      </View>
      <View style={styles.deliveryRating}>
        <Text style={styles.ratingText}>
          ⭐ {stats.rating?.toFixed(1) || '0.0'}
        </Text>
      </View>
    </View>
  ), [stats.rating]);

  const listHeader = useMemo(() => (
    <>
      <RatingStats stats={stats} currency={currency} />
      {displayedDeliveries.length > 0 && (
        <View style={styles.recentSectionHeader}>
          <Text style={styles.sectionTitle}>{i18n.t('reports.recentDeliveries')}</Text>
          <Text style={styles.sectionSubtitle}>
            {i18n.t('reports.last30Days')}
          </Text>
        </View>
      )}
    </>
  ), [stats, currency, displayedDeliveries.length]);

  return (
    <View style={styles.root}>
      <AuthGuard
        isAuthenticated={isAuthenticated}
        driver={driver}
        subtitle={i18n.t('reports.pleaseReconnectHistory')}
        showLoginButton={true}
        onLoginPress={() => navigation.navigate('Login')}
      />

      {hasCompletedOnboarding && driver && (
        <ScreenLayout
          title={i18n.t('reports.ratingsTitle')}
          subtitle={`${stats.completedOrders || 0} ${i18n.t('reports.deliveriesRated')}`}
        >
          <FlatList
            style={styles.list}
            data={displayedDeliveries}
            keyExtractor={(item) => String(item._id)}
            renderItem={renderDelivery}
            ListHeaderComponent={listHeader}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
              />
            }
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
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  recentSectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  deliveryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryId: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  deliveryDate: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  deliveryRating: {
    alignItems: 'flex-end',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.warning,
  },
  bottomSpacer: {
    height: 20,
  },
});
