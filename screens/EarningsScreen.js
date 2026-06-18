import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, RefreshControl } from 'react-native';
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

const { width } = Dimensions.get('window');

export default function EarningsScreen() {
  const {
    stats,
    loadDriverStats,
    invalidateDriverStatsCache,
    deliveries
  } = useDriver();

  const { currency } = useSettings();
  
  const recentDeliveries = useRecentDeliveries(deliveries, { days: 7, limit: 10, status: 'delivered' });
  const { refreshing, onRefresh } = useEarningsRefresh({ invalidateDriverStatsCache, loadDriverStats });
  
  const statCards = [
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
  ];

  return (
    <ScreenLayout
      title={i18n.t('reports.earningsTitle')}
      subtitle={new Date().toLocaleDateString(i18n.locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
    >
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
        {}
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

        {}
        <EarningsDetailsCard stats={stats} currency={currency} />

        {}
        {recentDeliveries.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>{i18n.t('reports.recentDeliveries')}</Text>

            {recentDeliveries.map((delivery) => (
              <RecentDeliveryCard
                key={delivery._id}
                delivery={delivery}
                currency={currency}
              />
            ))}
          </View>
        )}

        {}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  
  statsGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  recentSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  
  bottomSpacer: {
    height: 20,
  },
});
