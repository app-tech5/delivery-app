/**
 * Retourne le label associé à un statut de driver
 * @param {string} status - Statut du driver
 * @returns {string} Label du statut
 */
export const getStatusLabel = (status) => {
  switch (status) {
    case 'available': return 'Disponible';
    case 'on_delivery': return 'En livraison';
    case 'offline': return 'Hors ligne';
    case 'busy': return 'Occupé';
    default: return status;
  }
};

/**
 * État initial des statistiques du driver
 */
export const INITIAL_STATS = {
  todayDeliveries: 0,
  totalEarnings: 0,
  rating: 0,
  completedOrders: 0
};

/**
 * Vérifie si le driver est authentifié
 * @param {Object} driver - Objet driver
 * @returns {boolean} True si authentifié
 */
export const isDriverAuthenticated = (driver) => {
  return driver && driver._id;
};

/**
 * Met à jour le cache AsyncStorage avec les données du driver
 * @param {Object} driverData - Données du driver
 * @param {string} token - Token d'authentification
 */
export const updateDriverCache = async (driverData, token) => {
  try {
    if (driverData) {
      await AsyncStorage.setItem('driverData', JSON.stringify(driverData));
    }
    if (token) {
      await AsyncStorage.setItem('driverToken', token);
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du cache driver:', error);
  }
};

/**
 * Vide le cache AsyncStorage du driver
 */
export const clearDriverCache = async () => {
  try {
    await AsyncStorage.removeItem('driverData');
    await AsyncStorage.removeItem('driverToken');
  } catch (error) {
    console.error('Erreur lors du nettoyage du cache driver:', error);
  }
};
