import { useState, useEffect } from 'react';
import { getNearbyRestaurants } from '../api';
import { loadNearbyRestaurantsWithSmartCache } from '../utils/cacheUtils';

export const useNearbyRestaurants = (driverLocation) => {
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(false);
  
  const loadNearbyRestaurants = async () => {
    if (!driverLocation?.latitude || !driverLocation?.longitude) return;

    try {
      
      await loadNearbyRestaurantsWithSmartCache(
        driverLocation.latitude,
        driverLocation.longitude,
        10, 
        getNearbyRestaurants, 
        (data, fromCache) => {
          setNearbyRestaurants(data);
        },
        (data) => {
          setNearbyRestaurants(data);
        },
        (loading) => {
          
          setRestaurantsLoading(loading);
        },
        (errorMsg) => {
          
        }
      );
    } catch (error) {
    }
  };
  
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

