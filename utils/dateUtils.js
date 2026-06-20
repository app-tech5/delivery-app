import i18n from '../i18n';
import { getDriverDeliveryEarnings } from './driverDeliveryFee';

export const TIME_FILTERS = [
  { key: 'all', label: i18n.t('history.filters.all'), icon: 'calendar' },
  { key: 'today', label: i18n.t('history.filters.today'), icon: 'calendar-today' },
  { key: 'week', label: i18n.t('history.filters.week'), icon: 'calendar-week' },
  { key: 'month', label: i18n.t('history.filters.month'), icon: 'calendar-month' },
  { key: 'last_month', label: i18n.t('history.filters.last_month'), icon: 'calendar-month-outline' },
];

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

export const formatTime = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString(i18n.locale, {
    hour: '2-digit',
    minute: '2-digit'
  });
};

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

export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return checkDate.toDateString() === today.toDateString();
};

export const isYesterday = (date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const checkDate = new Date(date);
  return checkDate.toDateString() === yesterday.toDateString();
};

export const getStartOfDay = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const getEndOfDay = (date) => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

export const getDaysDifference = (date1, date2) => {
  const diffTime = Math.abs(date2 - date1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const groupDeliveriesByDate = (deliveries) => {
  const groups = {};

  deliveries.forEach(delivery => {
    const date = new Date(delivery.createdAt || delivery.updatedAt);
    const dateKey = date.toISOString().split('T')[0]; 

    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: date,
        deliveries: [],
        totalEarnings: 0,
        count: 0
      };
    }

    groups[dateKey].deliveries.push(delivery);
    groups[dateKey].totalEarnings += getDriverDeliveryEarnings(delivery);
    groups[dateKey].count += 1;
  });
  
  return Object.values(groups).sort((a, b) => b.date - a.date);
};

export const calculateHistoryStats = (deliveries, groupedDeliveries) => {
  const completedDeliveries = deliveries.filter(d => d.status === 'delivered');
  const totalEarnings = completedDeliveries.reduce(
    (sum, d) => sum + getDriverDeliveryEarnings(d),
    0
  );
  const totalDeliveries = completedDeliveries.length;
  
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