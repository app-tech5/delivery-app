import { useState, useEffect } from 'react';

export const useRecentDeliveries = (deliveries, options = {}) => {
  const { days = 7, limit = 10, status = 'delivered' } = options;
  const [recentDeliveries, setRecentDeliveries] = useState([]);

  useEffect(() => {
    if (deliveries.length > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const recent = deliveries
        .filter(delivery => {
          const deliveryDate = new Date(delivery.createdAt || delivery.updatedAt);
          return deliveryDate >= cutoffDate && delivery.status === status;
        })
        .sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt))
        .slice(0, limit);

      setRecentDeliveries(recent);
    } else {
      setRecentDeliveries([]);
    }
  }, [deliveries, days, limit, status]);

  return recentDeliveries;
};

