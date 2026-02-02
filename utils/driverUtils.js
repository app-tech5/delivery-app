import { getDriverStatusLabel } from './statusUtils';
import { updateDriverCache, clearDriverCache } from './storageUtils';

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

// Réexport des fonctions depuis les modules spécialisés
export { getDriverStatusLabel as getStatusLabel };
export { updateDriverCache, clearDriverCache };
