import i18n from '../i18n';
import { colors } from '../global';
import { getDriverDeliveryEarnings } from './driverDeliveryFee';

export const formatCurrency = (amount, currency = null) => {
  const value = Number(amount);
  const safeAmount = Number.isFinite(value) ? value : 0;
  const currencyObj = currency || { symbol: '€' };
  return `${safeAmount.toFixed(2)}${currencyObj.symbol || '€'}`;
};

const PAYMENT_METHOD_KEYS = {
  cash: 'payment.cash',
  credit_card: 'payment.creditCard',
  mobile_money: 'payment.mobileMoney',
  cash_on_delivery: 'payment.cashOnDelivery',
  paypal: 'payment.paypal',
  google_pay: 'payment.googlePay',
  apple_pay: 'payment.applePay',
};

export const formatPaymentMethod = (method) => {
  const key = PAYMENT_METHOD_KEYS[method];
  return key ? i18n.t(key) : i18n.t('common.notAvailable');
};

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

export const formatTime = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString(i18n.locale, {
    hour: '2-digit',
    minute: '2-digit'
  });
};

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

export const getStatusLabel = (status) => {
  switch (status) {
    case 'available': return i18n.t('driver.available');
    case 'on_delivery': return i18n.t('driver.onDelivery');
    case 'offline': return i18n.t('driver.offline');
    case 'busy': return i18n.t('driver.busy');
    default: return status;
  }
};

export const calculatePeriodStats = (deliveries, periodFilter = null) => {
  const filteredDeliveries = periodFilter ? deliveries.filter(periodFilter) : deliveries;

  const totalEarnings = filteredDeliveries.reduce(
    (sum, d) => sum + getDriverDeliveryEarnings(d),
    0
  );
  const totalDeliveries = filteredDeliveries.length;

  return {
    totalDeliveries,
    totalEarnings,
    averageEarnings: totalDeliveries > 0 ? totalEarnings / totalDeliveries : 0,
    deliveries: filteredDeliveries
  };
};

export const formatOrderNumber = (orderId) => {
  return orderId ? orderId.slice(-6) : 'N/A';
};

export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const getRatingColor = (rating) => {
  if (rating >= 4.5) return colors.success;
  if (rating >= 4.0) return colors.warning;
  return colors.error;
};

export const getTrendIcon = (value, threshold = 0) => {
  if (value > threshold) return { name: 'trending-up', color: colors.success };
  if (value < threshold) return { name: 'trending-down', color: colors.error };
  return { name: 'trending-flat', color: colors.text.secondary };
};

export { getNotificationTypeColor as getNotificationColor, getNotificationTypeIcon as getNotificationIcon } from './statusUtils';
