import { formatCurrency } from './currencyUtils';
import { formatDate } from './dateUtils';
import { getTransactionTypeColor, getTransactionTypeIcon } from './statusUtils';

// Réexport des fonctions depuis les modules spécialisés
export { formatCurrency, formatDate };
export { getTransactionTypeColor as getTransactionColor };
export { getTransactionTypeIcon as getTransactionIcon };

/**
 * Calcule les statistiques des transactions
 * @param {Array} transactions - Liste des transactions
 * @returns {Object} Statistiques calculées
 */
export const calculateTransactionStats = (transactions) => {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const count = transactions.length;
  const average = count > 0 ? total / count : 0;

  return {
    total,
    count,
    average
  };
};

/**
 * Filtre les transactions selon une période donnée
 * @param {Array} transactions - Liste des transactions
 * @param {string} filterKey - Clé du filtre ('all', 'today', 'week', 'month')
 * @returns {Array} Transactions filtrées
 */
export const filterTransactionsByPeriod = (transactions, filterKey) => {
  if (filterKey === 'all') return transactions;

  const cutoffDate = new Date();
  let days = null;

  switch (filterKey) {
    case 'today':
      cutoffDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      days = 7;
      break;
    case 'month':
      days = 30;
      break;
    default:
      return transactions;
  }

  if (days !== null) {
    cutoffDate.setDate(cutoffDate.getDate() - days);
  }

  return transactions.filter(transaction => transaction.date >= cutoffDate);
};

/**
 * Filtre les livraisons selon une période donnée
 * @param {Array} deliveries - Liste des livraisons
 * @param {string} filterKey - Clé du filtre ('all', 'today', 'week', 'month')
 * @returns {Array} Livraisons filtrées
 */
export const filterDeliveriesByPeriod = (deliveries, filterKey) => {
  if (filterKey === 'all') return deliveries;

  const cutoffDate = new Date();
  let days = null;

  switch (filterKey) {
    case 'today':
      cutoffDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      days = 7;
      break;
    case 'month':
      days = 30;
      break;
    default:
      return deliveries;
  }

  if (days !== null) {
    cutoffDate.setDate(cutoffDate.getDate() - days);
  }

  return deliveries.filter(delivery => {
    const deliveryDate = new Date(delivery.createdAt || delivery.updatedAt);
    return deliveryDate >= cutoffDate;
  });
};
