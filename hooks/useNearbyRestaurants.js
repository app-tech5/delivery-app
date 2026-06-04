import { useState, useEffect } from 'react';
import { getNearbyRestaurants } from '../api';
import { loadNearbyRestaurantsWithSmartCache } from '../utils/cacheUtils';

/**
 * Hook personnalisé pour gérer les restaurants proches
 * @param {Object} driverLocation - Position du driver (latitude, longitude)
 * @returns {Object} État et données des restaurants proches
 */
export const useNearbyRestaurants = (driverLocation) => {
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(false);

  // Charger les restaurants proches avec cache intelligent
  const loadNearbyRestaurants = async () => {
    if (!driverLocation?.latitude || !driverLocation?.longitude) return;

    try {
      // Utiliser le cache intelligent pour les restaurants proches
      await loadNearbyRestaurantsWithSmartCache(
        driverLocation.latitude,
        driverLocation.longitude,
        10, // rayon de 10km
        getNearbyRestaurants, // apiFetcher
        (data, fromCache) => {
          setNearbyRestaurants(data);
        },
        (data) => {
          setNearbyRestaurants(data);
        },
        (loading) => {
          // onLoadingStateChange
          setRestaurantsLoading(loading);
        },
        (errorMsg) => {
          // onError
          console.error('Erreur chargement restaurants proches:', errorMsg);
        }
      );
    } catch (error) {
      console.error('Error loading nearby restaurants with smart cache:', error);
    }
  };

  // Recharger quand la position change
  useEffect(() => {
    if (driverLocation?.latitude && driverLocation?.longitude) {
      loadNearbyRestaurants();
    }
  }, [driverLocation?.latitude, driverLocation?.longitude]);

  return {
    nearbyRestaurants,
    restaurantsLoading,
    loadNearbyRestaurants
  };
};


