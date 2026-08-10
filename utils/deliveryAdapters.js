import { formatCurrency, formatTime, formatOrderNumber } from './formatters';
import { getDriverDeliveryEarnings } from './driverDeliveryFee';
import { formatDeliveryAddress } from './addressUtils';
import i18n from '../i18n';

export const mapDeliveryToHistoryItem = (delivery, currency) => ({
  id: formatOrderNumber(delivery._id),
  time: formatTime(delivery.createdAt || delivery.updatedAt),
  amount: formatCurrency(getDriverDeliveryEarnings(delivery), currency),
  address: formatDeliveryAddress(
    delivery.delivery?.address,
    i18n.t('reports.addressNotAvailable')
  ),
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

