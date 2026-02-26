import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { formatCurrency } from '../utils/transactionUtils';

const TransactionSummary = ({ transactionStats, currency }) => {
  return (
    <View style={styles.summaryContainer}>
      <Card containerStyle={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{i18n.t('reports.totalLabel')}</Text>
          <Text style={styles.summaryValue}>{formatCurrency(transactionStats.total, currency)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{i18n.t('reports.countLabel')}</Text>
          <Text style={styles.summaryValue}>{transactionStats.count}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{i18n.t('reports.averageLabel')}</Text>
          <Text style={styles.summaryValue}>{formatCurrency(transactionStats.average, currency)}</Text>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryContainer: {
    padding: 16,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
});

export default TransactionSummary;


