import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert
} from 'react-native';
import { Card, Icon, Chip } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';

const { width } = Dimensions.get('window');

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

  // Périodes disponibles
  const periods = [
    { key: '7days', label: i18n.t('reports.last7Days'), days: 7 },
    { key: '30days', label: i18n.t('reports.last30Days'), days: 30 },
    { key: '90days', label: i18n.t('reports.last90Days'), days: 90 },
  ];

  // Filtrer les livraisons selon la période
  const periodDeliveries = useMemo(() => {
    const period = periods.find(p => p.key === activePeriod);
    if (!period) return deliveries;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - period.days);

    return deliveries.filter(delivery =>
      new Date(delivery.createdAt || delivery.updatedAt) >= cutoffDate
    );
  }, [deliveries, activePeriod]);

  // Statistiques de performance
  const performanceStats = useMemo(() => {
    const completedDeliveries = periodDeliveries.filter(d => d.status === 'delivered');
    const totalRevenue = completedDeliveries.reduce((sum, d) => sum + (d.delivery?.deliveryFee || 0), 0);
    const totalDeliveries = completedDeliveries.length;

    // Calculer les moyennes par jour
    const daysInPeriod = periods.find(p => p.key === activePeriod)?.days || 30;
    const avgDeliveriesPerDay = totalDeliveries / daysInPeriod;
    const avgRevenuePerDay = totalRevenue / daysInPeriod;

    // Trouver le meilleur et pire jour
    const dailyStats = {};
    completedDeliveries.forEach(delivery => {
      const date = new Date(delivery.createdAt || delivery.updatedAt).toDateString();
      if (!dailyStats[date]) {
        dailyStats[date] = { deliveries: 0, revenue: 0 };
      }
      dailyStats[date].deliveries += 1;
      dailyStats[date].revenue += delivery.delivery?.deliveryFee || 0;
    });

    const dailyArray = Object.values(dailyStats);
    const bestDay = dailyArray.reduce((best, day) =>
      day.revenue > best.revenue ? day : best, { revenue: 0 });
    const worstDay = dailyArray.reduce((worst, day) =>
      day.revenue < worst.revenue ? day : worst, { revenue: Infinity });

    // Taux de réussite
    const completionRate = deliveries.length > 0
      ? (completedDeliveries.length / deliveries.length) * 100
      : 0;

    return {
      totalRevenue,
      totalDeliveries,
      avgDeliveriesPerDay,
      avgRevenuePerDay,
      bestDay,
      worstDay: worstDay.revenue === Infinity ? { revenue: 0 } : worstDay,
      completionRate,
      avgRating: stats.rating || 0
    };
  }, [periodDeliveries, deliveries, stats, activePeriod]);

  // Statistiques de tendance (comparaison avec période précédente)
  const trendStats = useMemo(() => {
    const currentPeriod = periods.find(p => p.key === activePeriod);
    if (!currentPeriod) return null;

    const currentStats = performanceStats;

    // Période précédente (même durée)
    const prevCutoffDate = new Date();
    prevCutoffDate.setDate(prevCutoffDate.getDate() - (currentPeriod.days * 2));

    const prevDeliveries = deliveries.filter(delivery => {
      const date = new Date(delivery.createdAt || delivery.updatedAt);
      return date >= prevCutoffDate && date < new Date(Date.now() - currentPeriod.days * 24 * 60 * 60 * 1000);
    });

    const prevCompletedDeliveries = prevDeliveries.filter(d => d.status === 'delivered');
    const prevRevenue = prevCompletedDeliveries.reduce((sum, d) => sum + (d.delivery?.deliveryFee || 0), 0);
    const prevCount = prevCompletedDeliveries.length;

    const revenueChange = prevRevenue > 0 ? ((currentStats.totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const deliveriesChange = prevCount > 0 ? ((currentStats.totalDeliveries - prevCount) / prevCount) * 100 : 0;

    return {
      revenueChange,
      deliveriesChange,
      prevRevenue,
      prevDeliveries: prevCount
    };
  }, [performanceStats, deliveries, activePeriod]);

  // Gestionnaire de pull-to-refresh
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

  // Fonction pour formater les montants
  const formatCurrency = (amount) => {
    return `${amount?.toFixed(2) || '0.00'}${currency?.symbol || '€'}`;
  };

  // Fonction pour formater les pourcentages
  const formatPercentage = (value) => {
    return `${value?.toFixed(1) || '0.0'}%`;
  };

  // Fonction pour obtenir l'icône de tendance
  const getTrendIcon = (change) => {
    if (change > 5) return { name: 'trending-up', color: colors.success, type: 'material' };
    if (change < -5) return { name: 'trending-down', color: colors.error, type: 'material' };
    return { name: 'trending-flat', color: colors.text.secondary, type: 'material' };
  };

  // Fonction pour obtenir le label de tendance
  const getTrendLabel = (change) => {
    if (change > 5) return i18n.t('reports.increase');
    if (change < -5) return i18n.t('reports.decrease');
    return i18n.t('reports.noChange');
  };

  // Vérifier l'authentification
  if (!isAuthenticated || !driver) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.title}>{i18n.t('home.reconnect')}</Text>
          <Text style={styles.subtitle}>Please reconnect to view reports</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{i18n.t('reports.title')}</Text>
        <Text style={styles.headerSubtitle}>
          {performanceStats.totalDeliveries} deliveries • {formatCurrency(performanceStats.totalRevenue)}
        </Text>
      </View>

      {/* Sélecteur de période */}
      <View style={styles.periodSelector}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.periodScroll}
        >
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              onPress={() => setActivePeriod(period.key)}
              style={[
                styles.periodButton,
                activePeriod === period.key && styles.periodButtonActive
              ]}
            >
              <Text style={[
                styles.periodText,
                activePeriod === period.key && styles.periodTextActive
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

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
        {/* Métriques principales */}
        <View style={styles.metricsGrid}>
          <Card containerStyle={[styles.metricCard, styles.revenueCard]}>
            <View style={styles.metricIcon}>
              <Icon name="cash" type="material-community" size={24} color={colors.white} />
            </View>
            <View style={styles.metricContent}>
              <Text style={styles.metricValue}>{formatCurrency(performanceStats.totalRevenue)}</Text>
              <Text style={styles.metricLabel}>{i18n.t('reports.totalRevenue')}</Text>
              {trendStats && (
                <View style={styles.trendContainer}>
                  <Icon
                    name={getTrendIcon(trendStats.revenueChange).name}
                    type={getTrendIcon(trendStats.revenueChange).type}
                    size={14}
                    color={getTrendIcon(trendStats.revenueChange).color}
                  />
                  <Text style={[styles.trendText, { color: getTrendIcon(trendStats.revenueChange).color }]}>
                    {formatPercentage(Math.abs(trendStats.revenueChange))} {i18n.t('reports.vsPrevious')}
                  </Text>
                </View>
              )}
            </View>
          </Card>

          <Card containerStyle={[styles.metricCard, styles.deliveriesCard]}>
            <View style={styles.metricIcon}>
              <Icon name="truck-delivery" type="material-community" size={24} color={colors.white} />
            </View>
            <View style={styles.metricContent}>
              <Text style={styles.metricValue}>{performanceStats.totalDeliveries}</Text>
              <Text style={styles.metricLabel}>{i18n.t('reports.totalDeliveries')}</Text>
              {trendStats && (
                <View style={styles.trendContainer}>
                  <Icon
                    name={getTrendIcon(trendStats.deliveriesChange).name}
                    type={getTrendIcon(trendStats.deliveriesChange).type}
                    size={14}
                    color={getTrendIcon(trendStats.deliveriesChange).color}
                  />
                  <Text style={[styles.trendText, { color: getTrendIcon(trendStats.deliveriesChange).color }]}>
                    {formatPercentage(Math.abs(trendStats.deliveriesChange))} {i18n.t('reports.vsPrevious')}
                  </Text>
                </View>
              )}
            </View>
          </Card>

          <Card containerStyle={[styles.metricCard, styles.ratingCard]}>
            <View style={styles.metricIcon}>
              <Icon name="star" type="material" size={24} color={colors.white} />
            </View>
            <View style={styles.metricContent}>
              <Text style={styles.metricValue}>{performanceStats.avgRating.toFixed(1)}</Text>
              <Text style={styles.metricLabel}>{i18n.t('reports.averageRating')}</Text>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    key={star}
                    name={star <= Math.floor(performanceStats.avgRating) ? 'star' : 'star-border'}
                    type="material"
                    size={10}
                    color={colors.white}
                  />
                ))}
              </View>
            </View>
          </Card>

          <Card containerStyle={[styles.metricCard, styles.efficiencyCard]}>
            <View style={styles.metricIcon}>
              <Icon name="gauge" type="material-community" size={24} color={colors.white} />
            </View>
            <View style={styles.metricContent}>
              <Text style={styles.metricValue}>{formatPercentage(performanceStats.completionRate)}</Text>
              <Text style={styles.metricLabel}>{i18n.t('reports.completionRate')}</Text>
              <Text style={styles.metricSubtext}>
                {performanceStats.totalDeliveries}/{deliveries.length} completed
              </Text>
            </View>
          </Card>
        </View>

        {/* Analyse quotidienne */}
        <View style={styles.analysisSection}>
          <Text style={styles.sectionTitle}>{i18n.t('reports.analytics')}</Text>

          <Card containerStyle={styles.analysisCard}>
            <View style={styles.analysisRow}>
              <Text style={styles.analysisLabel}>{i18n.t('reports.averageDaily')}</Text>
              <View style={styles.analysisValues}>
                <Text style={styles.analysisValue}>
                  {performanceStats.avgDeliveriesPerDay.toFixed(1)} deliveries
                </Text>
                <Text style={styles.analysisSubvalue}>
                  {formatCurrency(performanceStats.avgRevenuePerDay)}/day
                </Text>
              </View>
            </View>

            <View style={styles.analysisRow}>
              <Text style={styles.analysisLabel}>{i18n.t('reports.bestDay')}</Text>
              <View style={styles.analysisValues}>
                <Text style={styles.analysisValue}>
                  {formatCurrency(performanceStats.bestDay.revenue)}
                </Text>
                <Text style={styles.analysisSubvalue}>
                  {performanceStats.bestDay.deliveries} deliveries
                </Text>
              </View>
            </View>

            <View style={styles.analysisRow}>
              <Text style={styles.analysisLabel}>{i18n.t('reports.worstDay')}</Text>
              <View style={styles.analysisValues}>
                <Text style={styles.analysisValue}>
                  {formatCurrency(performanceStats.worstDay.revenue)}
                </Text>
                <Text style={styles.analysisSubvalue}>
                  {performanceStats.worstDay.deliveries || 0} deliveries
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Performance Score */}
        <View style={styles.scoreSection}>
          <Text style={styles.sectionTitle}>{i18n.t('reports.performance')}</Text>

          <Card containerStyle={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <Text style={styles.scoreTitle}>{i18n.t('reports.performanceScore')}</Text>
              <Text style={styles.scoreValue}>
                {Math.round((performanceStats.completionRate + (performanceStats.avgRating * 20)) / 3)}/100
              </Text>
            </View>

            <View style={styles.scoreBreakdown}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>{i18n.t('reports.efficiency')}</Text>
                <Text style={styles.scoreItemValue}>
                  {formatPercentage(performanceStats.completionRate)}
                </Text>
              </View>

              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>{i18n.t('reports.consistency')}</Text>
                <Text style={styles.scoreItemValue}>
                  {performanceStats.avgRating.toFixed(1)}/5.0
                </Text>
              </View>

              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Volume</Text>
                <Text style={styles.scoreItemValue}>
                  {performanceStats.avgDeliveriesPerDay.toFixed(1)}/day
                </Text>
              </View>
            </View>
          </Card>
        </View>

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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 20,
    textAlign: 'center',
  },

  // Header
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
  },

  // Period selector
  periodSelector: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  periodScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  periodButton: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  periodTextActive: {
    color: colors.white,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },

  // Metrics grid
  metricsGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: (width - 48) / 2,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 0,
  },

  // Metric card colors
  revenueCard: {
    backgroundColor: colors.success,
  },
  deliveriesCard: {
    backgroundColor: colors.primary,
  },
  ratingCard: {
    backgroundColor: colors.warning,
  },
  efficiencyCard: {
    backgroundColor: colors.info,
  },

  metricIcon: {
    marginBottom: 12,
  },
  metricContent: {
    flex: 1,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  metricSubtext: {
    fontSize: 10,
    color: colors.white,
    opacity: 0.7,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 10,
    marginLeft: 4,
    opacity: 0.9,
  },
  ratingStars: {
    flexDirection: 'row',
    marginTop: 4,
  },

  // Analysis section
  analysisSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  analysisCard: {
    borderRadius: 12,
    padding: 16,
  },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  analysisLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
  },
  analysisValues: {
    alignItems: 'flex-end',
  },
  analysisValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  analysisSubvalue: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },

  // Score section
  scoreSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  scoreCard: {
    borderRadius: 12,
    padding: 16,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  scoreBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreItem: {
    alignItems: 'center',
    flex: 1,
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  scoreItemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },

  // Bottom spacer
  bottomSpacer: {
    height: 20,
  },
});
