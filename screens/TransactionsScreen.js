import React from 'react';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';
import { useTransactions } from '../hooks/useTransactions';
import { ScreenLayout, ReconnectMessage } from '../components';
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
  
  if (!isAuthenticated || !driver) {
    return <ReconnectMessage message={i18n.t('reports.pleaseReconnectTransactions')} />;
  }

  return (
    <ScreenLayout
      title={i18n.t('reports.transactionsTitle')}
      subtitle={`${transactionStats.count} ${transactionStats.count === 1 ? i18n.t('reports.transactionSingular') : i18n.t('reports.transactionPlural')}`}
    >
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
    </ScreenLayout>
  );
}
