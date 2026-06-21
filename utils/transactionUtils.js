import { formatCurrency } from './currencyUtils';
import { getOrderDate } from './driverDeliveryStats';
import { formatDate } from './dateUtils';
import { getTransactionTypeColor, getTransactionTypeIcon } from './statusUtils';

export { formatCurrency, formatDate };
export { getTransactionTypeColor as getTransactionColor };
export { getTransactionTypeIcon as getTransactionIcon };

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

export const filterDeliveriesByPeriod = (deliveries, filterKey) => {
  if (filterKey === 'all') return deliveries;

  if (filterKey === 'last_month') {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    return deliveries.filter((delivery) => {
      const deliveryDate = getOrderDate(delivery);
      return deliveryDate >= start && deliveryDate <= end;
    });
  }

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
      return [];
  }

  if (days !== null) {
    cutoffDate.setDate(cutoffDate.getDate() - days);
  }

  return deliveries.filter((delivery) => {
    const deliveryDate = getOrderDate(delivery);
    return deliveryDate >= cutoffDate;
  });
};
