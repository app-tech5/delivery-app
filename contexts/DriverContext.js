import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import apiClient from '../api';
import { config } from '../config';

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

  // Fonction utilitaire pour obtenir le label du statut
  const getStatusLabel = (status) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'on_delivery': return 'En livraison';
      case 'offline': return 'Hors ligne';
      case 'busy': return 'Occupé';
      default: return status;
    }
  };

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

  // Charger les commandes du driver
  const loadDriverOrders = async (status = null) => {
    try {
      if (isAuthenticated) {
        const ordersData = await apiClient.getDriverOrders(status);
        setDeliveries(ordersData); // On garde le même nom pour compatibilité
      }
    } catch (error) {
      console.error('Error loading driver orders:', error);
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
        await loadDriverOrders();
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
    if (config.DEMO_MODE) {
      // Mode démo : simulation locale uniquement
      setDriver(prevDriver => ({
        ...prevDriver,
        status: status
      }));
      Alert.alert('Mode Démo', `Statut changé à "${getStatusLabel(status)}" (simulation)`);
      return { driver: { ...driver, status } };
    }

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
      await loadDriverOrders(); // Recharger les commandes
      return response;
    } catch (error) {
      console.error('Update order status error:', error);
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
  };

  return (
    <DriverContext.Provider value={value}>
      {children}
    </DriverContext.Provider>
  );
};
