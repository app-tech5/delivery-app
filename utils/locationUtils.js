import * as Location from 'expo-location';

/**
 * Récupère la position GPS actuelle du driver (permission foreground requise).
 * @returns {Promise<{ latitude: number, longitude: number } | null>}
 */
export const getCurrentDriverCoordinates = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  const position = await Location.getCurrentPositionAsync({});
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
};

const LOCATION_WATCH_OPTIONS = {
  accuracy: Location.Accuracy.Balanced,
  distanceInterval: 50,
  timeInterval: 30000,
};

/**
 * Surveille la position GPS du driver (foreground).
 * @param {Function} onLocationUpdate - callback({ latitude, longitude })
 * @returns {Promise<Location.LocationSubscription | null>}
 */
export const watchDriverLocation = async (onLocationUpdate) => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  return Location.watchPositionAsync(LOCATION_WATCH_OPTIONS, (position) => {
    onLocationUpdate({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
  });
};

/**
 * Calcule la position du driver pour la carte
 * @param {Object} driver - Objet driver avec location
 * @returns {Object} Position pour la carte (latitude, longitude, latitudeDelta, longitudeDelta)
 */
export const getDriverLocation = (driver) => {
  return driver?.location?.coordinates ? {
    latitude: driver.location.coordinates[1], // latitude
    longitude: driver.location.coordinates[0], // longitude
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  } : {
    latitude: 48.8566, // Paris par défaut
    longitude: 2.3522,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };
};

/**
 * Filtre les livraisons actives (en cours de livraison)
 * @param {Array} deliveries - Liste des livraisons
 * @returns {Array} Livraisons actives
 */
export const getActiveDeliveries = (deliveries) => {
  return deliveries.filter(delivery => delivery.status === 'out_for_delivery');
};


