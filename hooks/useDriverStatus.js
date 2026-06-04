import { useState, useRef } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { useDriver } from '../contexts/DriverContext';
import { isDriverOnline } from '../utils/statusUtils';
import i18n from '../i18n';

/**
 * Hook personnalisé pour gérer les changements de statut du driver et des livraisons
 * @returns {Object} État de chargement et fonctions de gestion des statuts
 */
export const useDriverStatus = () => {
  const { driver, updateStatus, updateDeliveryStatus } = useDriver();
  const [localLoading, setLocalLoading] = useState(false);
  const statusUpdateRef = useRef(false);

  /**
   * Gestionnaire de changement de statut du driver
   * @param {string} newStatus - Nouveau statut du driver
   */
  const handleStatusChange = async (newStatus) => {
    if (localLoading || statusUpdateRef.current) return;
    if (newStatus === driver?.status) return;

    statusUpdateRef.current = true;
    setLocalLoading(true);

    try {
      const goingOnline = isDriverOnline(newStatus) && !isDriverOnline(driver?.status);

      if (goingOnline) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
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

  /**
   * Gestionnaire de changement de statut d'une commande
   * @param {string} orderId - ID de la commande
   * @param {string} newStatus - Nouveau statut de la livraison
   */
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
