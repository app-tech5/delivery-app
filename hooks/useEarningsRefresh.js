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
      Alert.alert(i18n.t('common.error'), i18n.t('reports.refreshStatsError'));
    } finally {
      setRefreshing(false);
    }
  };

  return {
    refreshing,
    onRefresh
  };
};
