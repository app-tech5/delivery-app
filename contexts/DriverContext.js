import React, { createContext, useContext, useEffect } from 'react';
import { io } from 'socket.io-client';
import { config } from '../config';
import { useDriverAuth } from '../hooks/useDriverAuth';
import { useDriverStats } from '../hooks/useDriverStats';
import { useDriverOrders } from '../hooks/useDriverOrders';
import { useDriverLocationWatch } from '../hooks/useDriverLocationWatch';

const DriverContext = createContext();

export const useDriver = () => {
  const context = useContext(DriverContext);
  if (!context) {
    throw new Error('useDriver must be used within a DriverProvider');
  }
  return context;
};

export const DriverProvider = ({ children }) => {
  const {
    driver,
    isLoading,
    isAuthenticated,
    needsOnboarding,
    login,
    register,
    completeOnboarding,
    logout: authLogout,
    setDriver,
  } = useDriverAuth();

  const hasCompletedOnboarding = !isLoading && isAuthenticated && !needsOnboarding;

  const {
    stats,
    loadDriverStats,
    invalidateDriverStatsCache,
  } = useDriverStats(driver, hasCompletedOnboarding);

  const {
    deliveries,
    loadDriverOrders,
    updateStatus: ordersUpdateStatus,
    acceptDelivery,
    updateDeliveryStatus,
    invalidateDeliveriesCache,
  } = useDriverOrders(driver, hasCompletedOnboarding);

  useDriverLocationWatch(driver, hasCompletedOnboarding, setDriver);

  const updateStatus = async (status, location = null) => {
    const result = await ordersUpdateStatus(status, location);
    const updatedDriver = result?.driver ?? (result?._id || result?.id ? result : null);
    if (updatedDriver) {
      setDriver(updatedDriver);
    }
    return result;
  };

  const logout = async () => {
    try {
      await authLogout();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  useEffect(() => {
    const userId = driver?.userId?._id || driver?.userId || driver?.users?.value;
    if (!hasCompletedOnboarding || !userId) return;

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
  }, [driver, hasCompletedOnboarding]);

  const value = {
    driver,
    needsOnboarding,
    hasCompletedOnboarding,
    isLoading,
    isAuthenticated,
    deliveries,
    stats,
    login,
    register,
    completeOnboarding,
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
