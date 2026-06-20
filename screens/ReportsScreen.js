import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
} from '../components';

export default function ReportsScreen() {
  const navigation = useNavigation();
  const {
    deliveries,
    stats,
    isAuthenticated,
    driver,
    hasCompletedOnboarding,
    loadDriverOrders,
    invalidateDeliveriesCache,
  } = useDriver();

  const { currency } = useSettings();

  const [activePeriod, setActivePeriod] = useState('30days');
  const [refreshing, setRefreshing] = useState(false);

  const { periods, performanceStats, trendStats } = useReportsData(deliveries, stats, activePeriod);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await invalidateDeliveriesCache();
      await loadDriverOrders();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      Alert.alert('Error', 'Unable to refresh reports');
    } finally {
      setRefreshing(false);
    }
  };

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

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </ScreenLayout>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  bottomSpacer: {
    height: 20,
  },
});
