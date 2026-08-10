import { getDriverDeliveryEarnings } from './driverDeliveryFee';
import { isToday } from './dateUtils';
import { formatDeliveryAddress } from './addressUtils';

export function getOrderDate(delivery) {
  return new Date(delivery?.createdAt || delivery?.updatedAt);
}

export function getDeliveredDeliveries(deliveries = []) {
  return deliveries.filter(
    (delivery) =>
      delivery?.status === 'delivered' &&
      delivery?.delivery?.type !== 'pickup'
  );
}

export function isDeliveredOnDate(delivery, dateCheck = isToday) {
  if (delivery?.status !== 'delivered' || delivery?.delivery?.type === 'pickup') {
    return false;
  }

  return dateCheck(getOrderDate(delivery));
}

function sumEarnings(list = []) {
  return list.reduce((sum, delivery) => sum + getDriverDeliveryEarnings(delivery), 0);
}

export function calculateDriverStatsFromDeliveries(deliveries = [], rating = 0) {
  const delivered = getDeliveredDeliveries(deliveries);
  const deliveredToday = delivered.filter((delivery) => isDeliveredOnDate(delivery));
  const cancelled = deliveries.filter(
    (delivery) =>
      delivery?.status === 'cancelled' &&
      delivery?.delivery?.type !== 'pickup'
  ).length;

  const todayEarnings = sumEarnings(deliveredToday);
  const totalEarnings = sumEarnings(delivered);
  const completionBase = delivered.length + cancelled;

  return {
    todayDeliveries: deliveredToday.length,
    todayEarnings,
    // lifetime — Profile "Total Earnings"; today uses todayEarnings
    totalEarnings,
    rating: Number(rating) || 0,
    completedOrders: delivered.length,
    cancelledOrders: cancelled,
    completionRate: completionBase > 0
      ? Math.round((delivered.length / completionBase) * 100)
      : 0,
  };
}

export function buildDeliveryTransaction(delivery, { deliveryDescription }) {
  return {
    id: delivery._id,
    type: 'delivery_fee',
    amount: getDriverDeliveryEarnings(delivery),
    description: `${deliveryDescription}${String(delivery._id).slice(-6)}`,
    date: getOrderDate(delivery),
    status: 'completed',
    details: {
      address: formatDeliveryAddress(delivery.delivery?.address),
      customer: delivery.user?.name,
      restaurant: delivery.restaurant?.name,
    },
  };
}
