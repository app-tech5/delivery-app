import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import apiClient from '../api';
import { updateDriverCache, clearDriverCache, INITIAL_STATS } from '../utils/driverUtils';

/**
 * Hook personnalisé pour gérer l'authentification du driver
 * @param {Function} onDriverLoaded - Callback appelé quand le driver est chargé
 * @param {Function} onStatsLoaded - Callback appelé quand les stats sont chargées
 * @param {Function} onOrdersLoaded - Callback appelé quand les commandes sont chargées
 * @returns {Object} État et fonctions d'authentification
 */
export const useDriverAuth = (onDriverLoaded, onStatsLoaded, onOrdersLoaded) => {
  const [driver, setDriver] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
              await updateDriverCache(freshDriverData);
            }
          } catch (refreshError) {
            console.log('Could not refresh driver data, using cached data:', refreshError.message);
          }

          // Charger les stats et commandes
          if (onStatsLoaded) await onStatsLoaded();
          if (onOrdersLoaded) await onOrdersLoaded();
        }
      } catch (error) {
        console.error('Error initializing driver:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDriver();
  }, [onDriverLoaded, onStatsLoaded, onOrdersLoaded]);

  // Connexion du driver
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await apiClient.driverLogin(email, password);

      if (response.user && response.token) {
        // Le driver a déjà été vérifié et stocké dans apiClient.driver lors de driverLogin()
        // On peut l'utiliser directement
        if (apiClient.driver) {
          setDriver(apiClient.driver);
          setIsAuthenticated(true);

          // Sauvegarder dans le cache
          await updateDriverCache(apiClient.driver, response.token);

          // Charger les données initiales
          if (onStatsLoaded) await onStatsLoaded();
          if (onOrdersLoaded) await onOrdersLoaded();

          // Essayer de rafraîchir les données driver en arrière-plan (sans bloquer)
          try {
            const freshDriverData = await apiClient.getDriverProfile();
            if (freshDriverData) {
              setDriver(freshDriverData);
            }
          } catch (refreshError) {
            // Ne pas échouer si le refresh échoue, on garde les données existantes
            console.log('Could not refresh driver data, using existing data');
          }
        } else {
          throw new Error('Données driver non disponibles');
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
      await clearDriverCache();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return {
    driver,
    isLoading,
    isAuthenticated,
    login,
    logout,
    setDriver,
    setIsAuthenticated
  };
};


