import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert
} from 'react-native';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';
import { useReportsData } from '../hooks/useReportsData';
import {
  ScreenLayout,
  PeriodSelector,
  ReportsMetricsGrid,
  AnalyticsCard,
  PerformanceScoreCard,
  AuthGuard,
  ReconnectMessage,
} from '../components';

export default function ReportsScreen() {
  const {
    deliveries,
    stats,
    isAuthenticated,
    driver,
    loadDriverStats,
    loadDriverOrders,
    invalidateDeliveriesCache,
    invalidateDriverStatsCache
  } = useDriver();

  const { currency } = useSettings();

  const [activePeriod, setActivePeriod] = useState('30days');
  const [refreshing, setRefreshing] = useState(false);
  
  const { periods, performanceStats, trendStats } = useReportsData(deliveries, stats, activePeriod);
  
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await invalidateDeliveriesCache();
      await invalidateDriverStatsCache();
      await loadDriverStats();
      await loadDriverOrders();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      Alert.alert('Error', 'Unable to refresh reports');
    } finally {
      setRefreshing(false);
    }
  };
  
  if (!isAuthenticated || !driver) {
    return <ReconnectMessage message="Please reconnect to view reports" />;
  }

  return (
    <ScreenLayout
      title={i18n.t('reports.title')}
      subtitle={`${performanceStats.totalDeliveries} deliveries • ${performanceStats.totalRevenue?.toFixed(2) || '0.00'}${currency?.symbol || '€'}`}
    >
      <PeriodSelector
        periods={periods}
        activePeriod={activePeriod}
        onPeriodChange={setActivePeriod}
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
        <ReportsMetricsGrid
          performanceStats={performanceStats}
          trendStats={trendStats}
          currency={currency}
          deliveries={deliveries}
        />

        <AnalyticsCard performanceStats={performanceStats} />

        <PerformanceScoreCard performanceStats={performanceStats} />

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
  bottomSpacer: {
    height: 20,
  },
});
