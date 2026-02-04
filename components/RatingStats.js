import React from 'react';
import { View, StyleSheet } from 'react-native';
import i18n from '../i18n';
import { colors } from '../global';

// Import components
import { EnhancedStatCard } from './EnhancedStatCard';

// Import utilities
import { formatCurrency } from '../utils';

const RatingStats = ({ stats, currency }) => {
  const ratingStats = [
    {
      value: stats.rating?.toFixed(1) || '0.0',
      label: i18n.t('reports.averageRating'),
      icon: { name: 'star', type: 'material' },
      backgroundColor: colors.warning,
      stars: stats.rating
    },
    {
      value: stats.completedOrders || 0,
      label: i18n.t('reports.totalRatedDeliveries'),
      icon: { name: 'package-variant-closed', type: 'material-community' },
      backgroundColor: colors.primary,
      trend: { name: 'timeline', color: colors.white }
    },
    {
      value: stats.todayDeliveries || 0,
      label: i18n.t('reports.todaysDeliveries'),
      icon: { name: 'truck-delivery', type: 'material-community' },
      backgroundColor: colors.success,
      trend: { name: 'trending-up', color: colors.white }
    },
    {
      value: formatCurrency(stats.totalEarnings, currency),
      label: i18n.t('reports.earnings'),
      icon: { name: 'cash', type: 'material-community' },
      backgroundColor: colors.info
    }
  ];

  return (
    <View style={styles.statsGrid}>
      {ratingStats.map((cardConfig, index) => (
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
  );
};

const styles = StyleSheet.create({
  statsGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default RatingStats;
