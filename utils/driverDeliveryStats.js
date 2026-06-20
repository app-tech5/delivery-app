import { getDriverDeliveryEarnings } from './driverDeliveryFee';
import { isToday } from './dateUtils';

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

export function calculateDriverStatsFromDeliveries(deliveries = [], rating = 0) {
  const delivered = getDeliveredDeliveries(deliveries);
  const deliveredToday = delivered.filter((delivery) => isDeliveredOnDate(delivery));

  const totalEarnings = deliveredToday.reduce(
    (sum, delivery) => sum + getDriverDeliveryEarnings(delivery),
    0
  );

  return {
    todayDeliveries: deliveredToday.length,
    totalEarnings,
    rating: Number(rating) || 0,
    completedOrders: delivered.length,
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
      address: delivery.delivery?.address,
      customer: delivery.user?.name,
      restaurant: delivery.restaurant?.name,
    },
  };
}
