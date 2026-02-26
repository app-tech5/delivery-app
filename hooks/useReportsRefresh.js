import { useState } from 'react';
import { Alert } from 'react-native';
import i18n from '../i18n';

/**
 * Hook personnalisé pour gérer le refresh des rapports
 * @param {Object} params - Paramètres pour le refresh
 * @param {Function} params.invalidateDeliveriesCache - Fonction pour invalider le cache des livraisons
 * @param {Function} params.invalidateDriverStatsCache - Fonction pour invalider le cache des stats
 * @param {Function} params.loadDriverStats - Fonction pour recharger les stats
 * @param {Function} params.loadDriverOrders - Fonction pour recharger les commandes
 * @returns {Object} État et fonction de refresh
 */
export const useReportsRefresh = ({
  invalidateDeliveriesCache,
  invalidateDriverStatsCache,
  loadDriverStats,
  loadDriverOrders
}) => {
  const [refreshing, setRefreshing] = useState(false);

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

  return {
    refreshing,
    onRefresh
  };
};


