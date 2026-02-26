import { useState } from 'react';
import { Alert } from 'react-native';
import { useDriver } from '../contexts/DriverContext';
import { getStatusLabel } from '../utils';
import i18n from '../i18n';

/**
 * Hook personnalisé pour gérer les changements de statut du driver et des livraisons
 * @returns {Object} État de chargement et fonctions de gestion des statuts
 */
export const useDriverStatus = () => {
  const { updateStatus, updateDeliveryStatus, isLoading: contextLoading } = useDriver();
  const [localLoading, setLocalLoading] = useState(false);
  const isLoading = contextLoading || localLoading;

  /**
   * Gestionnaire de changement de statut du driver
   * @param {string} newStatus - Nouveau statut du driver
   */
  const handleStatusChange = async (newStatus) => {
    if (isLoading) return;

    console.log('🔄 Tentative de changement de statut vers:', newStatus);

    // setLocalLoading(true);

    try {
      await updateStatus(newStatus, null); // Simplifié pour le debug

      console.log('🔄 updateStatus terminé, statut devrait être mis à jour');

      // Alert.alert(i18n.t('common.ok'), `${i18n.t('driver.statusChanged')} ${getStatusLabel(newStatus)}`);
    } catch (error) {
      console.error('❌ Erreur lors du changement de statut:', error);
      Alert.alert(i18n.t('errors.networkError'), i18n.t('driver.statusUpdateError'));
    } finally {
      setLocalLoading(false);
    }
  };

  /**
   * Gestionnaire de changement de statut d'une commande
   * @param {string} orderId - ID de la commande
   * @param {string} newStatus - Nouveau statut de la livraison
   */
  const handleOrderStatusChange = async (orderId, newStatus) => {
    if (isLoading) return;

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
    isLoading,
    handleStatusChange,
    handleOrderStatusChange
  };
};


