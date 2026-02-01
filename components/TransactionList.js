import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Icon } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import TransactionItem from './TransactionItem';
import EmptyState from './EmptyState';

const TransactionList = ({
  filteredTransactions,
  activeFilter,
  refreshing,
  onRefresh,
  currency
}) => {
  const getEmptyStateContent = () => {
    if (activeFilter === 'all') {
      return {
        title: i18n.t('reports.noTransactions'),
        subtitle: i18n.t('reports.noTransactionsAtAll')
      };
    }
    return {
      title: i18n.t('reports.noTransactionsFiltered'),
      subtitle: i18n.t('reports.noTransactionsForPeriod')
    };
  };

  const emptyStateContent = getEmptyStateContent();

  return (
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
      {filteredTransactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon
            name="receipt"
            type="material"
            size={64}
            color={colors.text.secondary}
          />
          <Text style={styles.emptyTitle}>
            {emptyStateContent.title}
          </Text>
          <Text style={styles.emptySubtitle}>
            {emptyStateContent.subtitle}
          </Text>
        </View>
      ) : (
        <View style={styles.transactionsList}>
          {filteredTransactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              currency={currency}
            />
          ))}
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  transactionsList: {
    padding: 16,
  },
  bottomSpacer: {
    height: 20,
  },
});

export default TransactionList;
