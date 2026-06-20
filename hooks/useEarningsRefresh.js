import { useState } from 'react';
import { Alert } from 'react-native';
import i18n from '../i18n';

export const useEarningsRefresh = ({ invalidateDeliveriesCache, loadDriverOrders }) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await invalidateDeliveriesCache();
      await loadDriverOrders();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des stats:', error);
      Alert.alert('Error', i18n.t('reports.refreshStatsError'));
    } finally {
      setRefreshing(false);
    }
  };

  return {
    refreshing,
    onRefresh
  };
};
