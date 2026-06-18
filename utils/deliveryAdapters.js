import { formatCurrency, formatTime, formatOrderNumber } from './formatters';

export const mapDeliveryToHistoryItem = (delivery, currency) => ({
  id: formatOrderNumber(delivery._id),
  time: formatTime(delivery.createdAt || delivery.updatedAt),
  amount: formatCurrency(delivery.delivery?.deliveryFee || 0, currency),
  address: delivery.delivery?.address || 'Adresse non disponible',
  customer: delivery.user?.name,
  restaurant: delivery.restaurant?.name,
  
  rawDelivery: delivery
});

export const mapDeliveryGroupToUI = (group, currency) => ({
  date: group.date,
  deliveries: group.deliveries.map(delivery => mapDeliveryToHistoryItem(delivery, currency)),
  totalEarnings: formatCurrency(group.totalEarnings, currency),
  count: group.count,
  
  rawGroup: group
});

export const mapHistoryStatsToUI = (stats, currency) => ({
  totalDeliveries: stats.totalDeliveries || 0,
  totalEarnings: formatCurrency(stats.totalEarnings || 0, currency),
  periodDeliveries: stats.periodDeliveries || 0,
  periodEarnings: formatCurrency(stats.periodEarnings || 0, currency),
  averageEarnings: formatCurrency(stats.averageEarnings || 0, currency),
  
  rawStats: stats
});

