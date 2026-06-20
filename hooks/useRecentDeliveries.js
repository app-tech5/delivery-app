import { useMemo } from 'react';
import { getOrderDate } from '../utils/driverDeliveryStats';

export const useRecentDeliveries = (deliveries, options = {}) => {
  const { days = 7, limit = 10, status = 'delivered' } = options;

  return useMemo(() => {
    if (deliveries.length === 0) {
      return [];
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return deliveries
      .filter((delivery) => {
        if (delivery.status !== status) {
          return false;
        }

        return getOrderDate(delivery) >= cutoffDate;
      })
      .sort((a, b) => getOrderDate(b) - getOrderDate(a))
      .slice(0, limit);
  }, [deliveries, days, limit, status]);
};
