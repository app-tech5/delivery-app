import { useState } from 'react';
import { Alert } from 'react-native';
import i18n from '../i18n';

/**
 * Hook personnalisé pour gérer le refresh de l'historique
 * @param {Object} params - Paramètres pour le refresh
 * @param {Function} params.invalidateDeliveriesCache - Fonction pour invalider le cache
 * @param {Function} params.loadDriverOrders - Fonction pour recharger les commandes
 * @returns {Object} État et fonction de refresh
 */
export const useHistoryRefresh = ({ invalidateDeliveriesCache, loadDriverOrders }) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await invalidateDeliveriesCache();
      await loadDriverOrders();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      Alert.alert('Erreur', 'Impossible de rafraîchir l\'historique');
    } finally {
      setRefreshing(false);
    }
  };

  return {
    refreshing,
    onRefresh
  };
};
