import { useState, useRef } from 'react';
import { Alert } from 'react-native';
import { useDriver } from '../contexts/DriverContext';
import { requestDriverLocationPermissions } from '../utils/locationUtils';
import { isDriverOnline, isDriverApproved } from '../utils/statusUtils';
import i18n from '../i18n';

export const useDriverStatus = () => {
  const { driver, updateStatus, updateDeliveryStatus } = useDriver();
  const [localLoading, setLocalLoading] = useState(false);
  const statusUpdateRef = useRef(false);
  
  const handleStatusChange = async (newStatus) => {
    if (localLoading || statusUpdateRef.current) return;
    if (newStatus === driver?.status) return;

    statusUpdateRef.current = true;
    setLocalLoading(true);

    try {
      const goingOnline = isDriverOnline(newStatus) && !isDriverOnline(driver?.status);

      if (goingOnline && !isDriverApproved(driver)) {
        Alert.alert(i18n.t('errors.permissionDenied'), i18n.t('driver.notApprovedError'));
        return;
      }

      if (goingOnline) {
        const { foreground } = await requestDriverLocationPermissions();
        if (!foreground) {
          Alert.alert(i18n.t('errors.networkError'), i18n.t('errors.locationError'));
          return;
        }
      }

      await updateStatus(newStatus, null);
    } catch (error) {
      console.error('❌ Erreur lors du changement de statut:', error);
      Alert.alert(i18n.t('errors.networkError'), i18n.t('driver.statusUpdateError'));
    } finally {
      statusUpdateRef.current = false;
      setLocalLoading(false);
    }
  };
  
  const handleOrderStatusChange = async (orderId, newStatus) => {
    if (localLoading) return;

    setLocalLoading(true);

    try {
      await updateDeliveryStatus(orderId, newStatus);
      Alert.alert(i18n.t('common.ok'), `${i18n.t('driver.orderDelivered')} (${i18n.t('driver.simulation')})`);
    } catch (error) {
      Alert.alert(i18n.t('errors.networkError'), i18n.t('driver.statusUpdateError'));
    } finally {
      setLocalLoading(false);
    }
  };

  return {
    isLoading: localLoading,
    handleStatusChange,
    handleOrderStatusChange
  };
};
