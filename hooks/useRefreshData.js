import { useState } from 'react';
import { Alert } from 'react-native';
import i18n from '../i18n';

export const useRefreshData = ({
  invalidateCaches = [],
  loadData = [],
  errorMessage = i18n.t('reports.refreshError')
} = {}) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      
      for (const invalidateCache of invalidateCaches) {
        if (typeof invalidateCache === 'function') {
          await invalidateCache();
        }
      }
      
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

export const useReportsRefresh = ({
  invalidateDeliveriesCache,
  loadDriverOrders
}) => {
  return useRefreshData({
    invalidateCaches: [invalidateDeliveriesCache],
    loadData: [loadDriverOrders],
    errorMessage: 'Unable to refresh reports'
  });
};

export const useEarningsRefresh = ({ invalidateDeliveriesCache, loadDriverOrders }) => {
  return useRefreshData({
    invalidateCaches: [invalidateDeliveriesCache],
    loadData: [loadDriverOrders],
    errorMessage: i18n.t('reports.refreshStatsError')
  });
};

export const useHistoryRefresh = ({ invalidateDeliveriesCache, loadDriverOrders }) => {
  return useRefreshData({
    invalidateCaches: [invalidateDeliveriesCache],
    loadData: [loadDriverOrders],
    errorMessage: 'Impossible de rafraîchir l\'historique'
  });
};

