import i18n from '../i18n';
import { colors } from '../global';

/**
 * Formate un montant avec la devise
 * @param {number} amount - Montant à formater
 * @param {Object} currency - Objet devise avec symbol
 * @returns {string} Montant formaté
 */
export const formatCurrency = (amount, currency = null) => {
  const currencyObj = currency || { symbol: '€' };
  return `${amount?.toFixed(2) || '0.00'}${currencyObj.symbol || '€'}`;
};

/**
 * Formate une date selon les règles métier
 * @param {Date} date - Date à formater
 * @returns {string} Date formatée
 */
export const formatDate = (date) => {
  const locale = i18n.locale;
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return i18n.t('reports.today');
  if (diffDays === 2) return i18n.t('reports.yesterday');

  return date.toLocaleDateString(i18n.locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

/**
 * Formate une heure
 * @param {Date|string} date - Date/heure à formater
 * @returns {string} Heure formatée
 */
export const formatTime = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString(i18n.locale, {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Retourne la couleur associée à un statut
 * @param {string} status - Statut du driver ou de la livraison
 * @param {string} type - Type d'élément ('driver' ou 'delivery')
 * @returns {string} Couleur hex
 */
export const getStatusColor = (status, type = 'delivery') => {
  if (type === 'driver') {
    switch (status) {
      case 'available': return colors.driver.available;
      case 'on_delivery': return colors.driver.onDelivery;
      case 'offline': return colors.driver.offline;
      case 'busy': return colors.driver.busy;
      default: return colors.grey[500];
    }
  } else {
    // Pour les livraisons
    switch (status) {
      case 'delivered': return colors.success;
      case 'cancelled': return colors.error;
      case 'out_for_delivery': return colors.driver.onDelivery;
      case 'accepted': return colors.primary;
      case 'pending': return colors.warning;
      default: return colors.text.secondary;
    }
  }
};

/**
 * Retourne le label associé à un statut
 * @param {string} status - Statut du driver
 * @returns {string} Label du statut
 */
export const getStatusLabel = (status) => {
  switch (status) {
    case 'available': return i18n.t('driver.available');
    case 'on_delivery': return i18n.t('driver.onDelivery');
    case 'offline': return i18n.t('driver.offline');
    case 'busy': return i18n.t('driver.busy');
    default: return status;
  }
};

/**
 * Calcule les statistiques pour une période donnée
 * @param {Array} deliveries - Liste des livraisons
 * @param {Function} periodFilter - Fonction de filtrage pour la période
 * @returns {Object} Statistiques calculées
 */
export const calculatePeriodStats = (deliveries, periodFilter = null) => {
  const filteredDeliveries = periodFilter ? deliveries.filter(periodFilter) : deliveries;

  const totalEarnings = filteredDeliveries.reduce((sum, d) => sum + (d.delivery?.deliveryFee || 0), 0);
  const totalDeliveries = filteredDeliveries.length;

  return {
    totalDeliveries,
    totalEarnings,
    averageEarnings: totalDeliveries > 0 ? totalEarnings / totalDeliveries : 0,
    deliveries: filteredDeliveries
  };
};

/**
 * Formate un numéro de commande
 * @param {string} orderId - ID de la commande
 * @returns {string} Numéro formaté
 */
export const formatOrderNumber = (orderId) => {
  return orderId ? orderId.slice(-6) : 'N/A';
};

/**
 * Tronque un texte avec des points de suspension
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur maximale
 * @returns {string} Texte tronqué
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Retourne la couleur associée à une note
 * @param {number} rating - Note (0-5)
 * @returns {string} Couleur hex
 */
export const getRatingColor = (rating) => {
  if (rating >= 4.5) return colors.success;
  if (rating >= 4.0) return colors.warning;
  return colors.error;
};

/**
 * Retourne l'icône et la couleur de tendance
 * @param {number} value - Valeur à comparer
 * @param {number} threshold - Seuil de comparaison
 * @returns {Object} {name, color} de l'icône
 */
export const getTrendIcon = (value, threshold = 0) => {
  if (value > threshold) return { name: 'trending-up', color: colors.success };
  if (value < threshold) return { name: 'trending-down', color: colors.error };
  return { name: 'trending-flat', color: colors.text.secondary };
};

/**
 * Formate le temps relatif (il y a X minutes/heures/jours)
 * @param {Date|string} timestamp - Timestamp à formater
 * @returns {string} Temps relatif formaté
 */
export const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const diff = now - new Date(timestamp);
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return i18n.t('notifications.justNow');
  if (minutes < 60) return `${minutes} ${i18n.t('notifications.minutesAgo')}`;
  if (hours < 24) return `${hours} ${i18n.t('notifications.hoursAgo')}`;
  return `${days} ${i18n.t('notifications.daysAgo')}`;
};

/**
 * Retourne la couleur associée au type de notification
 * @param {string} type - Type de notification
 * @returns {string} Couleur hex
 */
export const getNotificationColor = (type) => {
  switch (type) {
    case 'order': return colors.primary;
    case 'system': return colors.info;
    case 'promotion': return colors.success;
    default: return colors.text.secondary;
  }
};

/**
 * Retourne l'icône associée au type de notification
 * @param {string} type - Type de notification
 * @returns {string} Nom de l'icône Material Design
 */
export const getNotificationIcon = (type) => {
  switch (type) {
    case 'order': return 'local-shipping';
    case 'system': return 'info';
    case 'promotion': return 'local-offer';
    default: return 'notifications';
  }
};
