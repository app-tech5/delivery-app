import { useState } from 'react';
import { Alert } from 'react-native';
import i18n from '../i18n';

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

