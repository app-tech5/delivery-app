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
 * Formate une date de manière relative (aujourd'hui, hier, il y a X jours)
 * @param {Date} date - Date à formater
 * @returns {string} Date formatée
 */
export const formatDate = (date) => {
  const parsedDate = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return i18n.t('reports.today');
  if (diffDays === 2) return i18n.t('reports.yesterday');
  if (diffDays <= 7) return `${diffDays - 1} ${i18n.t('reports.daysAgo')}`;

  return parsedDate.toLocaleDateString(i18n.locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
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
 * Formate une date et heure complète
 * @param {Date|string} date - Date à formater
 * @returns {string} Date et heure formatées
 */
export const formatDateTime = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const dateStr = dateObj.toLocaleDateString(i18n.locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const timeStr = formatTime(dateObj);
  return `${dateStr} ${timeStr}`;
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

/**
 * Calcule la différence en jours entre deux dates
 * @param {Date} date1 - Première date
 * @param {Date} date2 - Deuxième date
 * @returns {number} Différence en jours
 */
export const getDaysDifference = (date1, date2) => {
  const diffTime = Math.abs(date2 - date1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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