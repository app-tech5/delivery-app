import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import apiClient from '../api';
import { config } from '../config';
import { loadDeliveriesWithSmartCache, clearDeliveriesCache, loadDriverStatsWithSmartCache, clearDriverStatsCache } from '../utils/cacheUtils';

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

  // Initialisation du driver depuis AsyncStorage et refresh depuis API
  useEffect(() => {
    const initializeDriver = async () => {
      try {
        const driverData = await AsyncStorage.getItem('driverData');
        const token = await AsyncStorage.getItem('driverToken');

        if (driverData && token) {
          // Charger d'abord les données du cache
          const parsedDriver = JSON.parse(driverData);
          setDriver(parsedDriver);
          setIsAuthenticated(true);
          apiClient.token = token;
          apiClient.driver = parsedDriver;

          // Puis rafraîchir avec les données les plus récentes de l'API
          try {
            const freshDriverData = await apiClient.getDriverProfile();
            if (freshDriverData) {
              setDriver(freshDriverData);
              // Mettre à jour le cache avec les nouvelles données
              await AsyncStorage.setItem('driverData', JSON.stringify(freshDriverData));
            }
          } catch (refreshError) {
            console.log('Could not refresh driver data, using cached data:', refreshError.message);
          }

          // Charger les stats et commandes
          await loadDriverStats();
          await loadDriverOrders();
        }
      } catch (error) {
        console.error('Error initializing driver:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDriver();
  }, []);

  // Charger les statistiques du driver avec cache intelligent
  const loadDriverStats = async () => {
    if (!isAuthenticated || !driver?._id) {
      console.log('❌ Driver non authentifié, impossible de charger les stats');
      return;
    }

    try {
      // Utiliser le cache intelligent pour les stats
      await loadDriverStatsWithSmartCache(
        driver._id, // driverId
        () => apiClient.getDriverStats(), // apiFetcher
        (data, fromCache) => {
          // onDataLoaded - appelé quand les données sont prêtes (cache ou API)
          setStats(data);
          if (fromCache) {
            console.log('🔄 Stats chargées depuis le cache dans DriverContext');
          }
        },
        (data) => {
          // onDataUpdated - appelé quand les données sont mises à jour depuis l'API
          setStats(data);
          console.log('🔄 Stats mises à jour depuis l\'API dans DriverContext');
        },
        (loading) => {
          // onLoadingStateChange - on pourrait utiliser un état de chargement spécifique
          console.log(`🔄 État de chargement des stats: ${loading}`);
        },
        (errorMsg) => {
          // onError
          console.error('Erreur chargement stats:', errorMsg);
        }
      );
    } catch (error) {
      console.error('Error loading driver stats with smart cache:', error);
    }
  };

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


  // Connexion du driver
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await apiClient.driverLogin(email, password);

      if (response.user && response.token) {
        // Récupérer les données les plus récentes du driver depuis l'API
        try {
          const freshDriverData = await apiClient.getDriverProfile();
          setDriver(freshDriverData);
          setIsAuthenticated(true);

          // Charger les données initiales
          await loadDriverStats();
          await loadDriverOrders();
        } catch (driverError) {
          console.error('Error loading fresh driver data:', driverError);
          // Fallback: utiliser les données de la réponse de login
          if (response.driver) {
            setDriver(response.driver);
            setIsAuthenticated(true);
          }
        }
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

  // Invalider le cache des stats (pour forcer un rechargement)
  const invalidateDriverStatsCache = async () => {
    if (driver?._id) {
      try {
        await clearDriverStatsCache(driver._id);
        console.log('🗑️ Cache des stats invalidé');
        await loadDriverStats(); // Recharger immédiatement
      } catch (error) {
        console.error('Erreur lors de l\'invalidation du cache des stats:', error);
      }
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
