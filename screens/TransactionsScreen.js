import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';
import { useTransactions } from '../hooks/useTransactions';
import { ScreenHeader } from '../components';
import TransactionFilters from '../components/TransactionFilters';
import TransactionSummary from '../components/TransactionSummary';
import TransactionList from '../components/TransactionList';

export default function TransactionsScreen() {
  const {
    deliveries,
    isAuthenticated,
    driver,
    loadDriverOrders,
    invalidateDeliveriesCache
  } = useDriver();

  const { currency } = useSettings();

  const {
    filteredTransactions,
    transactionStats,
    activeFilter,
    setActiveFilter,
    refreshing,
    onRefresh,
    periodFilters
  } = useTransactions(deliveries, loadDriverOrders, invalidateDeliveriesCache);

  // Vérifier l'authentification
  if (!isAuthenticated || !driver) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.title}>{i18n.t('home.reconnect')}</Text>
          <Text style={styles.subtitle}>{i18n.t('reports.pleaseReconnectTransactions')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={i18n.t('reports.transactionsTitle')}
        subtitle={`${transactionStats.count} ${transactionStats.count === 1 ? i18n.t('reports.transactionSingular') : i18n.t('reports.transactionPlural')}`}
        containerStyle={{ paddingTop: 10 }}
      />

      <TransactionFilters
        periodFilters={periodFilters}
        activeFilter={activeFilter}
        onFilterPress={setActiveFilter}
      />

      <TransactionSummary
        transactionStats={transactionStats}
        currency={currency}
      />

      <TransactionList
        filteredTransactions={filteredTransactions}
        activeFilter={activeFilter}
        refreshing={refreshing}
        onRefresh={onRefresh}
        currency={currency}
      />
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
});
