import i18n from '../i18n';

/**
 * Filtres temporels disponibles pour l'historique
 */
export const TIME_FILTERS = [
  { key: 'all', label: i18n.t('history.filters.all'), icon: 'calendar' },
  { key: 'today', label: i18n.t('history.filters.today'), icon: 'calendar-today' },
  { key: 'week', label: i18n.t('history.filters.week'), icon: 'calendar-week' },
  { key: 'month', label: i18n.t('history.filters.month'), icon: 'calendar-month' },
  { key: 'last_month', label: i18n.t('history.filters.last_month'), icon: 'calendar-month-outline' },
];

/**
 * Filtre les livraisons selon une période donnée
 * @param {Array} deliveries - Liste des livraisons
 * @param {string} filterKey - Clé du filtre ('all', 'today', 'week', etc.)
 * @returns {Array} Livraisons filtrées
 */
export const filterDeliveriesByPeriod = (deliveries, filterKey) => {
  if (filterKey === 'all') return deliveries;

  const now = new Date();

  switch (filterKey) {
    case 'today':
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return deliveries.filter(d =>
        new Date(d.createdAt || d.updatedAt) >= today
      );

    case 'week':
      const weekStart = new Date();
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      return deliveries.filter(d =>
        new Date(d.createdAt || d.updatedAt) >= weekStart
      );

    case 'month':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return deliveries.filter(d =>
        new Date(d.createdAt || d.updatedAt) >= monthStart
      );

    case 'last_month':
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
      return deliveries.filter(d => {
        const date = new Date(d.createdAt || d.updatedAt);
        return date >= lastMonthStart && date < lastMonthEnd;
      });

    default:
      return deliveries;
  }
};

/**
 * Groupe les livraisons par date
 * @param {Array} deliveries - Liste des livraisons
 * @returns {Array} Livraisons groupées par date
 */
export const groupDeliveriesByDate = (deliveries) => {
  const groups = {};

  deliveries.forEach(delivery => {
    const date = new Date(delivery.createdAt || delivery.updatedAt);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: date,
        deliveries: [],
        totalEarnings: 0,
        count: 0
      };
    }

    groups[dateKey].deliveries.push(delivery);
    groups[dateKey].totalEarnings += delivery.delivery?.deliveryFee || 0;
    groups[dateKey].count += 1;
  });

  // Convertir en array et trier par date décroissante
  return Object.values(groups).sort((a, b) => b.date - a.date);
};

/**
 * Calcule les statistiques globales pour l'historique
 * @param {Array} deliveries - Toutes les livraisons
 * @param {Array} groupedDeliveries - Livraisons groupées par période
 * @returns {Object} Statistiques globales et de période
 */
export const calculateHistoryStats = (deliveries, groupedDeliveries) => {
  const completedDeliveries = deliveries.filter(d => d.status === 'delivered');
  const totalEarnings = completedDeliveries.reduce((sum, d) => sum + (d.delivery?.deliveryFee || 0), 0);
  const totalDeliveries = completedDeliveries.length;

  // Statistiques de la période filtrée
  const periodDeliveries = groupedDeliveries.reduce((sum, group) => sum + group.count, 0);
  const periodEarnings = groupedDeliveries.reduce((sum, group) => sum + group.totalEarnings, 0);

  return {
    totalDeliveries,
    totalEarnings,
    periodDeliveries,
    periodEarnings,
    averageEarnings: periodDeliveries > 0 ? periodEarnings / periodDeliveries : 0
  };
};

/**
 * Vérifie si une date est aujourd'hui
 * @param {Date} date - Date à vérifier
 * @returns {boolean} True si c'est aujourd'hui
 */
export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return checkDate.toDateString() === today.toDateString();
};

/**
 * Vérifie si une date est hier
 * @param {Date} date - Date à vérifier
 * @returns {boolean} True si c'est hier
 */
export const isYesterday = (date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const checkDate = new Date(date);
  return checkDate.toDateString() === yesterday.toDateString();
};

/**
 * Obtient le début de la journée pour une date donnée
 * @param {Date} date - Date
 * @returns {Date} Début de la journée
 */
export const getStartOfDay = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

/**
 * Obtient la fin de la journée pour une date donnée
 * @param {Date} date - Date
 * @returns {Date} Fin de la journée
 */
export const getEndOfDay = (date) => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};
