import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { formatCurrency } from '../utils';

const AnalyticsCard = ({ performanceStats }) => {
  return (
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
  );
};

const styles = StyleSheet.create({
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
});

export default AnalyticsCard;


