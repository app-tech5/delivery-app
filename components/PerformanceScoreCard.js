import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';

const PerformanceScoreCard = ({ performanceStats }) => {
  const formatPercentage = (value) => `${value?.toFixed(1) || '0.0'}%`;

  const performanceScore = Math.round((performanceStats.completionRate + (performanceStats.avgRating * 20)) / 3);

  return (
    <View style={styles.scoreSection}>
      <Text style={styles.sectionTitle}>{i18n.t('reports.performance')}</Text>

      <Card containerStyle={styles.scoreCard}>
        <View style={styles.scoreHeader}>
          <Text style={styles.scoreTitle}>{i18n.t('reports.performanceScore')}</Text>
          <Text style={styles.scoreValue}>{performanceScore}/100</Text>
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
  );
};

const styles = StyleSheet.create({
  scoreSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
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
});

export default PerformanceScoreCard;
