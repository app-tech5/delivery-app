import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import EnhancedStatCard from './EnhancedStatCard';
import { formatCurrency, getTrendIcon } from '../utils';

const ReportsMetricsGrid = ({ performanceStats, trendStats, currency, deliveries }) => {
  const formatPercentage = (value) => `${value?.toFixed(1) || '0.0'}%`;

  return (
    <View style={styles.metricsGrid}>
      {/* Revenue Card */}
      <EnhancedStatCard
        value={formatCurrency(performanceStats.totalRevenue, currency)}
        label={i18n.t('reports.totalRevenue')}
        icon={{ name: 'cash', type: 'material-community' }}
        backgroundColor={colors.success}
        trend={trendStats ? getTrendIcon(trendStats.revenueChange, 5) : null}
      >
        {trendStats && (
          <View style={styles.trendContainer}>
            <Icon
              name={getTrendIcon(trendStats.revenueChange, 5).name}
              type="material"
              size={14}
              color={colors.white}
            />
            <Text style={[styles.trendText, { color: getTrendIcon(trendStats.revenueChange, 5).color }]}>
              {formatPercentage(Math.abs(trendStats.revenueChange))} {i18n.t('reports.vsPrevious')}
            </Text>
          </View>
        )}
      </EnhancedStatCard>

      {/* Deliveries Card */}
      <EnhancedStatCard
        value={performanceStats.totalDeliveries}
        label={i18n.t('reports.totalDeliveries')}
        icon={{ name: 'truck-delivery', type: 'material-community' }}
        backgroundColor={colors.primary}
        trend={trendStats ? getTrendIcon(trendStats.deliveriesChange, 5) : null}
      >
        {trendStats && (
          <View style={styles.trendContainer}>
            <Icon
              name={getTrendIcon(trendStats.deliveriesChange, 5).name}
              type="material"
              size={14}
              color={colors.white}
            />
            <Text style={[styles.trendText, { color: getTrendIcon(trendStats.deliveriesChange, 5).color }]}>
              {formatPercentage(Math.abs(trendStats.deliveriesChange))} {i18n.t('reports.vsPrevious')}
            </Text>
          </View>
        )}
      </EnhancedStatCard>

      {/* Rating Card */}
      <EnhancedStatCard
        value={performanceStats.avgRating.toFixed(1)}
        label={i18n.t('reports.averageRating')}
        icon={{ name: 'star', type: 'material' }}
        backgroundColor={colors.warning}
        stars={performanceStats.avgRating}
      />

      {/* Efficiency Card */}
      <EnhancedStatCard
        value={formatPercentage(performanceStats.completionRate)}
        label={i18n.t('reports.completionRate')}
        icon={{ name: 'gauge', type: 'material-community' }}
        backgroundColor={colors.info}
      >
        <Text style={styles.metricSubtext}>
          {performanceStats.totalDeliveries}/{deliveries.length} completed
        </Text>
      </EnhancedStatCard>
    </View>
  );
};

const styles = StyleSheet.create({
  metricsGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 12,
    left: 16,
  },
  trendText: {
    fontSize: 10,
    marginLeft: 4,
    opacity: 0.9,
  },
  metricSubtext: {
    fontSize: 10,
    color: colors.white,
    opacity: 0.7,
    position: 'absolute',
    bottom: 12,
    left: 16,
  },
});

export default ReportsMetricsGrid;
