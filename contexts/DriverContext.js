import React, { createContext, useContext } from 'react';
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
    updateStatus,
    acceptDelivery,
    updateDeliveryStatus,
    invalidateDeliveriesCache
  } = useDriverOrders(driver, isAuthenticated);

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
  };

  return (
    <DriverContext.Provider value={value}>
      {children}
    </DriverContext.Provider>
  );
};
