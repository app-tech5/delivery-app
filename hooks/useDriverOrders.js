import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import apiClient from '../api';
import { config } from '../config';
import { loadDeliveriesWithSmartCache, clearDeliveriesCache } from '../utils/cacheUtils';
import { isDriverAuthenticated } from '../utils/driverUtils';
import { getDriverStatusLabel } from '../utils/statusUtils';
import { preloadDeliverySettingsForOrders } from '../utils/driverDeliveryFee';

export const useDriverOrders = (driver, hasCompletedOnboarding) => {
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    if (!hasCompletedOnboarding) {
      setDeliveries([]);
    }
  }, [hasCompletedOnboarding]);

  const loadDriverOrders = async (status = null) => {
    if (!hasCompletedOnboarding || !driver?._id) {
      console.log('❌ Driver non authentifié, impossible de charger les livraisons');
      return;
    }

    try {
      const applyDeliveries = async (data) => {
        await preloadDeliverySettingsForOrders(data);
        setDeliveries(data);
      };

      await loadDeliveriesWithSmartCache(
        driver._id, 
        () => apiClient.getDriverOrders(status), 
        async (data, fromCache) => {
          await applyDeliveries(data);
          if (fromCache) {
            console.log('🔄 Livraisons chargées depuis le cache dans DriverContext');
          }
        },
        async (data) => {
          await applyDeliveries(data);
          console.log('🔄 Livraisons mises à jour depuis l\'API dans DriverContext');
        },
        (loading) => {
          
          console.log(`🔄 État de chargement des livraisons: ${loading}`);
        },
        (errorMsg) => {
          
          console.error('Erreur chargement livraisons:', errorMsg);
        }
      );
    } catch (error) {
      console.error('Error loading driver orders with smart cache:', error);
    }
  };
  
  const updateStatus = async (status, location = null) => {
    if (config.DEMO_MODE) {
      
      return { driver: { ...(driver || {}), status } };
    }

    try {
      const response = await apiClient.updateDriverStatus(status, location);
      return response;
    } catch (error) {
      console.error('Update status error:', error);
      throw error;
    }
  };
  
  const acceptDelivery = async (orderId) => {
    if (config.DEMO_MODE) {
      
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
      const response = await apiClient.updateOrder(orderId, {
        driver: driver?._id,
        status: 'out_for_delivery'
      });
      await apiClient.updateDriver({ currentOrder: orderId });
      await loadDriverOrders(); 
      return response;
    } catch (error) {
      console.error('Accept order error:', error);
      throw error;
    }
  };
  
  const updateDeliveryStatus = async (orderId, status, location = null) => {
    if (config.DEMO_MODE) {
      
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
      const response = await apiClient.updateOrder(orderId, { status });
      if (status === 'delivered' || status === 'cancelled') {
        await apiClient.updateDriver({ currentOrder: null });
      }
      
      if (driver?._id) {
        await clearDeliveriesCache(driver._id);
      }
      await loadDriverOrders(); 
      return response;
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  };
  
  const invalidateDeliveriesCache = async () => {
    if (driver?._id) {
      try {
        await clearDeliveriesCache(driver._id);
        console.log('🗑️ Cache des livraisons invalidé');
        await loadDriverOrders(); 
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
