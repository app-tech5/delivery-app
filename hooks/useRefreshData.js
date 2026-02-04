import { useState } from 'react';
import { Alert } from 'react-native';
import i18n from '../i18n';

/**
 * Hook générique pour gérer le refresh de données
 * Peut être configuré pour différentes combinaisons de données à rafraîchir
 * @param {Object} config - Configuration du refresh
 * @param {Function[]} config.invalidateCaches - Fonctions pour invalider les caches (optionnel)
 * @param {Function[]} config.loadData - Fonctions pour recharger les données (optionnel)
 * @param {string} config.errorMessage - Message d'erreur personnalisé (optionnel)
 * @returns {Object} État et fonction de refresh
 */
export const useRefreshData = ({
  invalidateCaches = [],
  loadData = [],
  errorMessage = i18n.t('reports.refreshError')
} = {}) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Invalider les caches d'abord
      for (const invalidateCache of invalidateCaches) {
        if (typeof invalidateCache === 'function') {
          await invalidateCache();
        }
      }

      // Recharger les données
      for (const loadFunction of loadData) {
        if (typeof loadFunction === 'function') {
          await loadFunction();
        }
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      Alert.alert('Error', errorMessage);
    } finally {
      setRefreshing(false);
    }
  };

  return {
    refreshing,
    onRefresh
  };
};

/**
 * Hook spécialisé pour le refresh des rapports (livraisons + stats + commandes)
 * @deprecated Utilisez useRefreshData à la place avec la configuration appropriée
 */
export const useReportsRefresh = ({
  invalidateDeliveriesCache,
  invalidateDriverStatsCache,
  loadDriverStats,
  loadDriverOrders
}) => {
  return useRefreshData({
    invalidateCaches: [invalidateDeliveriesCache, invalidateDriverStatsCache],
    loadData: [loadDriverStats, loadDriverOrders],
    errorMessage: 'Unable to refresh reports'
  });
};

/**
 * Hook spécialisé pour le refresh des statistiques de revenus
 * @deprecated Utilisez useRefreshData à la place avec la configuration appropriée
 */
export const useEarningsRefresh = ({ invalidateDriverStatsCache, loadDriverStats }) => {
  return useRefreshData({
    invalidateCaches: [invalidateDriverStatsCache],
    loadData: [loadDriverStats],
    errorMessage: i18n.t('reports.refreshStatsError')
  });
};

/**
 * Hook spécialisé pour le refresh de l'historique
 * @deprecated Utilisez useRefreshData à la place avec la configuration appropriée
 */
export const useHistoryRefresh = ({ invalidateDeliveriesCache, loadDriverOrders }) => {
  return useRefreshData({
    invalidateCaches: [invalidateDeliveriesCache],
    loadData: [loadDriverOrders],
    errorMessage: 'Impossible de rafraîchir l\'historique'
  });
};
