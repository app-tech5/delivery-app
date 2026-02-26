import { formatCurrency, formatTime, formatOrderNumber } from './formatters';

/**
 * Transforme une livraison backend en format UI pour l'historique
 * @param {Object} delivery - Objet livraison du backend
 * @param {Object} currency - Objet devise
 * @returns {Object} Données formatées pour l'UI
 */
export const mapDeliveryToHistoryItem = (delivery, currency) => ({
  id: formatOrderNumber(delivery._id),
  time: formatTime(delivery.createdAt || delivery.updatedAt),
  amount: formatCurrency(delivery.delivery?.deliveryFee || 0, currency),
  address: delivery.delivery?.address || 'Adresse non disponible',
  customer: delivery.user?.name,
  restaurant: delivery.restaurant?.name,
  // Données brutes pour logique métier
  rawDelivery: delivery
});

/**
 * Transforme un groupe de livraisons en format UI
 * @param {Object} group - Groupe de livraisons (date, deliveries, totalEarnings, count)
 * @param {Object} currency - Objet devise
 * @returns {Object} Groupe formaté pour l'UI
 */
export const mapDeliveryGroupToUI = (group, currency) => ({
  date: group.date,
  deliveries: group.deliveries.map(delivery => mapDeliveryToHistoryItem(delivery, currency)),
  totalEarnings: formatCurrency(group.totalEarnings, currency),
  count: group.count,
  // Données brutes pour logique métier
  rawGroup: group
});

/**
 * Transforme les statistiques d'historique en format UI
 * @param {Object} stats - Statistiques brutes
 * @param {Object} currency - Objet devise
 * @returns {Object} Statistiques formatées
 */
export const mapHistoryStatsToUI = (stats, currency) => ({
  totalDeliveries: stats.totalDeliveries || 0,
  totalEarnings: formatCurrency(stats.totalEarnings || 0, currency),
  periodDeliveries: stats.periodDeliveries || 0,
  periodEarnings: formatCurrency(stats.periodEarnings || 0, currency),
  averageEarnings: formatCurrency(stats.averageEarnings || 0, currency),
  // Données brutes pour logique métier
  rawStats: stats
});


