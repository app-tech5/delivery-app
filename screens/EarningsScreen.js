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
  EnhancedStatCard,
  EarningsDetailsCard,
  RecentDeliveryCard,
  ScreenLayout
} from '../components';

import { formatCurrency, getTrendIcon } from '../utils';

export default function EarningsScreen() {
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

  const recentDeliveries = useRecentDeliveries(deliveries, { days: 7, limit: 10, status: 'delivered' });
  const { refreshing, onRefresh } = useEarningsRefresh({
    invalidateDeliveriesCache,
    loadDriverOrders,
  });

  const statCards = useMemo(() => ([
    {
      value: formatCurrency(stats.totalEarnings, currency),
      label: i18n.t('reports.todayEarningsLabel'),
      icon: { name: 'cash', type: 'material-community' },
      backgroundColor: colors.success,
      trend: getTrendIcon(stats.totalEarnings, 10)
    },
    {
      value: stats.todayDeliveries || 0,
      label: i18n.t('reports.todaysDeliveries'),
      icon: { name: 'truck-delivery', type: 'material-community' },
      backgroundColor: colors.primary,
      trend: getTrendIcon(stats.todayDeliveries, 2)
    },
    {
      value: stats.rating?.toFixed(1) || '0.0',
      label: i18n.t('home.rating'),
      icon: { name: 'star', type: 'material' },
      backgroundColor: colors.warning,
      stars: stats.rating
    },
    {
      value: stats.completedOrders || 0,
      label: i18n.t('reports.totalDeliveries'),
      icon: { name: 'package-variant-closed', type: 'material-community' },
      backgroundColor: colors.info,
      trend: { name: 'timeline', color: colors.white }
    }
  ]), [stats, currency]);

  const renderRecentDelivery = useCallback(({ item: delivery }) => (
    <View style={styles.recentItem}>
      <RecentDeliveryCard
        delivery={delivery}
        currency={currency}
      />
    </View>
  ), [currency]);

  const listHeader = useMemo(() => (
    <>
      <View style={styles.statsGrid}>
        {statCards.map((cardConfig, index) => (
          <EnhancedStatCard
            key={index}
            value={cardConfig.value}
            label={cardConfig.label}
            icon={cardConfig.icon}
            backgroundColor={cardConfig.backgroundColor}
            trend={cardConfig.trend}
            stars={cardConfig.stars}
          />
        ))}
      </View>

      <EarningsDetailsCard stats={stats} currency={currency} />

      {recentDeliveries.length > 0 && (
        <Text style={styles.sectionTitle}>{i18n.t('reports.recentDeliveries')}</Text>
      )}
    </>
  ), [statCards, stats, currency, recentDeliveries.length]);

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
          title={i18n.t('reports.earningsTitle')}
          subtitle={new Date().toLocaleDateString(i18n.locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        >
          <FlatList
            style={styles.list}
            data={recentDeliveries}
            keyExtractor={(item) => String(item._id)}
            renderItem={renderRecentDelivery}
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
  statsGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  recentItem: {
    paddingHorizontal: 16,
  },
  bottomSpacer: {
    height: 20,
  },
});
