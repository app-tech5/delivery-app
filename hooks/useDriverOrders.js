import { useState, useEffect } from 'react';
import apiClient from '../api';
import { config } from '../config';
import { loadDeliveriesWithSmartCache, clearDeliveriesCache, getDeliveriesFromCache, saveDeliveriesToCache } from '../utils/cacheUtils';
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

  const applyDeliveries = (data) => {
    setDeliveries(data);
    void preloadDeliverySettingsForOrders(data).then(() => {
      setDeliveries((prev) => (prev.length > 0 ? [...prev] : prev));
    });
  };

  const updateDemoDeliveryStatus = async (orderId, status) => {
    let nextDeliveries = [];

    setDeliveries((prevDeliveries) => {
      nextDeliveries = prevDeliveries.map((delivery) =>
        String(delivery._id) === String(orderId)
          ? {
              ...delivery,
              status,
              updatedAt: new Date().toISOString(),
            }
          : delivery
      );
      return nextDeliveries;
    });

    if (driver?._id && nextDeliveries.length > 0) {
      await saveDeliveriesToCache(nextDeliveries, driver._id);
    }

    return { success: true };
  };

  const loadDriverOrders = async (status = null) => {
    if (!hasCompletedOnboarding || !driver?._id) {
      console.log('❌ Driver non authentifié, impossible de charger les livraisons');
      return;
    }

    try {
      if (config.DEMO_MODE) {
        const cachedData = await getDeliveriesFromCache(driver._id);

        if (cachedData?.deliveries?.length) {
          applyDeliveries(cachedData.deliveries);
          return;
        }

        const freshData = await apiClient.getDriverOrders(status);
        if (Array.isArray(freshData)) {
          await saveDeliveriesToCache(freshData, driver._id);
          applyDeliveries(freshData);
        }

        return;
      }

      await loadDeliveriesWithSmartCache(
        driver._id, 
        () => apiClient.getDriverOrders(status), 
        (data, fromCache) => {
          applyDeliveries(data);
          if (fromCache) {
            console.log('🔄 Livraisons chargées depuis le cache dans DriverContext');
          }
        },
        (data) => {
          applyDeliveries(data);
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
      await updateDemoDeliveryStatus(orderId, 'out_for_delivery');
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
      return updateDemoDeliveryStatus(orderId, status);
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
