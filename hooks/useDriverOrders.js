import { useState } from 'react';
import { Alert } from 'react-native';
import apiClient from '../api';
import { config } from '../config';
import { loadDeliveriesWithSmartCache, clearDeliveriesCache } from '../utils/cacheUtils';
import { isDriverAuthenticated, getStatusLabel } from '../utils/driverUtils';

/**
 * Hook personnalisé pour gérer les commandes du driver
 * @param {Object} driver - Objet driver
 * @param {boolean} isAuthenticated - État d'authentification
 * @returns {Object} État et fonctions des commandes
 */
export const useDriverOrders = (driver, isAuthenticated) => {
  const [deliveries, setDeliveries] = useState([]);

  // Charger les commandes du driver avec cache intelligent
  const loadDriverOrders = async (status = null) => {
    if (!isAuthenticated || !driver?._id) {
      console.log('❌ Driver non authentifié, impossible de charger les livraisons');
      return;
    }

    try {
      // Utiliser le cache intelligent pour les livraisons
      await loadDeliveriesWithSmartCache(
        driver._id, // driverId
        () => apiClient.getDriverOrders(status), // apiFetcher
        (data, fromCache) => {
          // onDataLoaded - appelé quand les données sont prêtes (cache ou API)
          setDeliveries(data);
          if (fromCache) {
            console.log('🔄 Livraisons chargées depuis le cache dans DriverContext');
          }
        },
        (data) => {
          // onDataUpdated - appelé quand les données sont mises à jour depuis l'API
          setDeliveries(data);
          console.log('🔄 Livraisons mises à jour depuis l\'API dans DriverContext');
        },
        (loading) => {
          // onLoadingStateChange - on pourrait utiliser un état de chargement spécifique
          console.log(`🔄 État de chargement des livraisons: ${loading}`);
        },
        (errorMsg) => {
          // onError
          console.error('Erreur chargement livraisons:', errorMsg);
        }
      );
    } catch (error) {
      console.error('Error loading driver orders with smart cache:', error);
    }
  };

  // Mettre à jour le statut du driver
  const updateStatus = async (status, location = null) => {
    if (config.DEMO_MODE) {
      // Mode démo : simulation locale uniquement
      Alert.alert('Mode Démo', `Statut changé à "${getStatusLabel(status)}" (simulation)`);
      return { driver: { ...(driver || {}), status } };
    }

    try {
      const response = await apiClient.updateDriverStatus(status, location);
      if (response.driver) {
        console.log('🔄 API - Driver mis à jour:', response.driver);
      } else {
        console.warn('⚠️ API - Pas de driver dans la réponse:', response);
      }
      return response;
    } catch (error) {
      console.error('Update status error:', error);
      throw error;
    }
  };

  // Accepter une commande
  const acceptDelivery = async (orderId) => {
    if (config.DEMO_MODE) {
      // Mode démo : simulation locale
      setDeliveries(prevDeliveries =>
        prevDeliveries.map(delivery =>
          delivery._id === orderId
            ? { ...delivery, status: 'out_for_delivery' }
            : delivery
        )
      );
      Alert.alert('Mode Démo', 'Commande acceptée (simulation)');
      return { success: true };
    }

    try {
      const response = await apiClient.acceptOrder(orderId);
      await loadDriverOrders(); // Recharger les commandes
      return response;
    } catch (error) {
      console.error('Accept order error:', error);
      throw error;
    }
  };

  // Mettre à jour le statut d'une commande
  const updateDeliveryStatus = async (orderId, status, location = null) => {
    if (config.DEMO_MODE) {
      // Mode démo : simulation locale
      setDeliveries(prevDeliveries =>
        prevDeliveries.map(delivery =>
          delivery._id === orderId
            ? { ...delivery, status: status }
            : delivery
        )
      );
      Alert.alert('Mode Démo', `Commande marquée comme "${status === 'delivered' ? 'livrée' : status}" (simulation)`);
      return { success: true };
    }

    try {
      const response = await apiClient.updateOrderStatus(orderId, status);
      // Invalider le cache après mise à jour pour forcer un rechargement frais
      if (driver?._id) {
        await clearDeliveriesCache(driver._id);
      }
      await loadDriverOrders(); // Recharger les commandes
      return response;
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  };

  // Invalider le cache des livraisons (pour forcer un rechargement)
  const invalidateDeliveriesCache = async () => {
    if (driver?._id) {
      try {
        await clearDeliveriesCache(driver._id);
        console.log('🗑️ Cache des livraisons invalidé');
        await loadDriverOrders(); // Recharger immédiatement
      } catch (error) {
        console.error('Erreur lors de l\'invalidation du cache des livraisons:', error);
      }
    }
  };

  return {
    deliveries,
    loadDriverOrders,
    updateStatus,
    acceptDelivery,
    updateDeliveryStatus,
    invalidateDeliveriesCache
  };
};
