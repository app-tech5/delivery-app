import React, { createContext, useContext, useEffect } from 'react';
import { io } from 'socket.io-client';
import { config } from '../config';
import { useDriverAuth } from '../hooks/useDriverAuth';
import { useDriverStats } from '../hooks/useDriverStats';
import { useDriverOrders } from '../hooks/useDriverOrders';
import { INITIAL_STATS } from '../utils/driverUtils';

const DriverContext = createContext();

export const useDriver = () => {
  const context = useContext(DriverContext);
  if (!context) {
    throw new Error('useDriver must be used within a DriverProvider');
  }
  return context;
};

export const DriverProvider = ({ children }) => {
  // Hook d'authentification
  const {
    driver,
    isLoading,
    isAuthenticated,
    login,
    logout: authLogout,
    setDriver,
    setIsAuthenticated
  } = useDriverAuth();

  // Hook des statistiques
  const {
    stats,
    loadDriverStats,
    invalidateDriverStatsCache
  } = useDriverStats(driver, isAuthenticated);

  // Hook des commandes
  const {
    deliveries,
    loadDriverOrders,
    updateStatus: ordersUpdateStatus,
    acceptDelivery,
    updateDeliveryStatus,
    invalidateDeliveriesCache
  } = useDriverOrders(driver, isAuthenticated);

  // Wrapper pour updateStatus qui met à jour l'état du driver
  const updateStatus = async (status, location = null) => {
    const result = await ordersUpdateStatus(status, location);

    // En mode démo, mettre à jour l'état du driver localement
    if (result && result.driver) {
      setDriver(result.driver);
    }

    return result;
  };

  // Wrapper pour le logout qui nettoie tous les états
  const logout = async () => {
    try {
      await authLogout();
      // Les autres états seront remis à zéro par les hooks
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  useEffect(() => {
    const userId = driver?.userId?._id || driver?.userId;
    if (!isAuthenticated || !userId) return;

    const url = String(config.API_BASE_URL).replace(/\/api\/?$/, '');
    const socket = io(url);

    socket.on('connect', () => {
      socket.emit('joinUserRoom', String(userId));
    });

    socket.on('user-disabled', () => {
      logout();
    });

    return () => {
      socket.disconnect();
    };
  }, [driver, isAuthenticated]);

  const value = {
    driver,
    isLoading,
    isAuthenticated,
    deliveries,
    stats,
    login,
    logout,
    updateStatus,
    acceptDelivery,
    updateDeliveryStatus,
    loadDriverStats,
    loadDriverOrders,
    invalidateDeliveriesCache,
    invalidateDriverStatsCache,
    setDriver,
  };

  return (
    <DriverContext.Provider value={value}>
      {children}
    </DriverContext.Provider>
  );
};
