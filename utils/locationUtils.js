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


