import { useState } from 'react';
import { Alert } from 'react-native';
import i18n from '../i18n';

export const useReportsRefresh = ({
  invalidateDeliveriesCache,
  loadDriverOrders
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await invalidateDeliveriesCache();
      await loadDriverOrders();
    } catch (error) {
      Alert.alert(i18n.t('common.error'), i18n.t('reports.refreshReportsError'));
    } finally {
      setRefreshing(false);
    }
  };

  return {
    refreshing,
    onRefresh
  };
};
