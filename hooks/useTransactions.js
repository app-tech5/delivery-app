import { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import i18n from '../i18n';
import { PERIOD_FILTERS } from '../utils/transactionsData';
import { calculateTransactionStats, filterTransactionsByPeriod } from '../utils/transactionUtils';

/**
 * Hook personnalisé pour gérer les transactions
 * @param {Array} deliveries - Liste des livraisons
 * @param {Function} loadDriverOrders - Fonction pour charger les commandes du driver
 * @param {Function} invalidateDeliveriesCache - Fonction pour invalider le cache des livraisons
 * @returns {Object} État et fonctions pour gérer les transactions
 */
export const useTransactions = (deliveries, loadDriverOrders, invalidateDeliveriesCache) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Calculer les transactions depuis les livraisons
  const transactions = useMemo(() => {
    const completedDeliveries = deliveries.filter(delivery => delivery.status === 'delivered');

    return completedDeliveries
      .map(delivery => ({
        id: delivery._id,
        type: 'delivery_fee',
        amount: delivery.delivery?.deliveryFee || 0,
        description: `${i18n.t('reports.deliveryDescription')}${delivery._id.slice(-6)}`,
        date: new Date(delivery.createdAt || delivery.updatedAt),
        status: 'completed',
        details: {
          address: delivery.delivery?.address,
          customer: delivery.user?.name,
          restaurant: delivery.restaurant?.name
        }
      }))
      .sort((a, b) => b.date - a.date); // Plus récent en premier
  }, [deliveries]);

  // Filtrer les transactions selon la période
  const filteredTransactions = useMemo(() => {
    return filterTransactionsByPeriod(transactions, activeFilter);
  }, [transactions, activeFilter]);

  // Calculer les statistiques des transactions filtrées
  const transactionStats = useMemo(() => {
    return calculateTransactionStats(filteredTransactions);
  }, [filteredTransactions]);

  // Gestionnaire de pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await invalidateDeliveriesCache();
      await loadDriverOrders();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      Alert.alert('Error', i18n.t('reports.refreshTransactionsError'));
    } finally {
      setRefreshing(false);
    }
  };

  return {
    transactions,
    filteredTransactions,
    transactionStats,
    activeFilter,
    setActiveFilter,
    refreshing,
    onRefresh,
    periodFilters: PERIOD_FILTERS
  };
};
