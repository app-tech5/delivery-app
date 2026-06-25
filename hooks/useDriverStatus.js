import { useState, useRef } from 'react';
import { Alert } from 'react-native';
import apiClient from '../api';
import { useDriver } from '../contexts/DriverContext';
import { config } from '../config';
import { isDemoDriverAccount, isLocalDemoDriverProfile } from '../utils/demoDriverUtils';
import { requestDriverLocationPermissions } from '../utils/locationUtils';
import { isDriverOnline, isDriverApproved } from '../utils/statusUtils';
import i18n from '../i18n';

export const useDriverStatus = () => {
  const { driver, updateStatus } = useDriver();
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

      const skipsLocationPermission =
        isDemoDriverAccount(apiClient.user, driver)
        || (config.DEMO_MODE && isLocalDemoDriverProfile(driver));

      if (goingOnline && !skipsLocationPermission) {
        const { foreground } = await requestDriverLocationPermissions(apiClient.user, driver);
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
  
  return {
    isLoading: localLoading,
    handleStatusChange,
  };
};
