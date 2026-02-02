import i18n from '../i18n';

/**
 * Formate une date de manière relative (aujourd'hui, hier, il y a X jours)
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