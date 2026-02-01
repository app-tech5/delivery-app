import i18n from '../i18n';
import { colors } from '../global';

/**
 * Formate un montant avec la devise
 * @param {number} amount - Montant à formater
 * @param {Object} currency - Objet devise
 * @returns {string} Montant formaté
 */
export const formatCurrency = (amount, currency) => {
  return `${amount?.toFixed(2) || '0.00'}${currency?.symbol || '€'}`;
};

/**
 * Formate une date de manière relative
 * @param {Date} date - Date à formater
 * @returns {string} Date formatée
 */
export const formatDate = (date) => {
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return i18n.t('reports.today');
  if (diffDays === 2) return i18n.t('reports.yesterday');
  if (diffDays <= 7) return `${diffDays - 1} ${i18n.t('reports.daysAgo')}`;

  return date.toLocaleDateString(i18n.locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Retourne la couleur associée au type de transaction
 * @param {string} type - Type de transaction
 * @returns {string} Couleur hex
 */
export const getTransactionColor = (type) => {
  switch (type) {
    case 'delivery_fee': return colors.success;
    case 'bonus': return colors.primary;
    case 'penalty': return colors.error;
    default: return colors.text.secondary;
  }
};

/**
 * Retourne l'icône associée au type de transaction
 * @param {string} type - Type de transaction
 * @returns {string} Nom de l'icône Material Community
 */
export const getTransactionIcon = (type) => {
  switch (type) {
    case 'delivery_fee': return 'truck-delivery';
    case 'bonus': return 'gift';
    case 'penalty': return 'alert-circle';
    default: return 'cash';
  }
};

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
