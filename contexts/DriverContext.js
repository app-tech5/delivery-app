import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api';

const DriverContext = createContext();

export const useDriver = () => {
  const context = useContext(DriverContext);
  if (!context) {
    throw new Error('useDriver must be used within a DriverProvider');
  }
  return context;
};

export const DriverProvider = ({ children }) => {
  const [driver, setDriver] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deliveries, setDeliveries] = useState([]);
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    totalEarnings: 0,
    rating: 0,
    completedOrders: 0
  });

  // Initialisation du driver depuis AsyncStorage
  useEffect(() => {
    const initializeDriver = async () => {
      try {
        const driverData = await AsyncStorage.getItem('driverData');
        const token = await AsyncStorage.getItem('driverToken');

        if (driverData && token) {
          const parsedDriver = JSON.parse(driverData);
          setDriver(parsedDriver);
          setIsAuthenticated(true);
          apiClient.token = token;
          apiClient.driver = parsedDriver;
        }
      } catch (error) {
        console.error('Error initializing driver:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDriver();
  }, []);

  // Charger les statistiques du driver
  const loadDriverStats = async () => {
    try {
      if (isAuthenticated) {
        const statsData = await apiClient.getDriverStats();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading driver stats:', error);
    }
  };

  // Charger les livraisons du driver
  const loadDriverDeliveries = async (status = null) => {
    try {
      if (isAuthenticated) {
        const deliveriesData = await apiClient.getDriverDeliveries(status);
        setDeliveries(deliveriesData);
      }
    } catch (error) {
      console.error('Error loading driver deliveries:', error);
    }
  };

  // Connexion du driver
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await apiClient.driverLogin(email, password);

      if (response.driver && response.token) {
        setDriver(response.driver);
        setIsAuthenticated(true);

        // Charger les données initiales
        await loadDriverStats();
        await loadDriverDeliveries();
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Déconnexion
  const logout = async () => {
    try {
      await apiClient.logout();
      setDriver(null);
      setIsAuthenticated(false);
      setDeliveries([]);
      setStats({
        todayDeliveries: 0,
        totalEarnings: 0,
        rating: 0,
        completedOrders: 0
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Mettre à jour le statut du driver
  const updateStatus = async (status, location = null) => {
    try {
      const response = await apiClient.updateDriverStatus(status, location);
      if (response.driver) {
        setDriver(response.driver);
      }
      return response;
    } catch (error) {
      console.error('Update status error:', error);
      throw error;
    }
  };

  // Accepter une livraison
  const acceptDelivery = async (deliveryId) => {
    try {
      const response = await apiClient.acceptDelivery(deliveryId);
      await loadDriverDeliveries(); // Recharger les livraisons
      return response;
    } catch (error) {
      console.error('Accept delivery error:', error);
      throw error;
    }
  };

  // Mettre à jour le statut d'une livraison
  const updateDeliveryStatus = async (deliveryId, status, location = null) => {
    try {
      const response = await apiClient.updateDeliveryStatus(deliveryId, status, location);
      await loadDriverDeliveries(); // Recharger les livraisons
      return response;
    } catch (error) {
      console.error('Update delivery status error:', error);
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
    loadDriverDeliveries,
  };

  return (
    <DriverContext.Provider value={value}>
      {children}
    </DriverContext.Provider>
  );
};
