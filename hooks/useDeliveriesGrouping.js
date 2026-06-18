import { useMemo } from 'react';
import { filterDeliveriesByPeriod } from '../utils/transactionUtils';
import { groupDeliveriesByDate, calculateHistoryStats } from '../utils/dateUtils';

export const useDeliveriesGrouping = (deliveries, activeFilter = 'all') => {
  const groupedDeliveries = useMemo(() => {
    
    const completedDeliveries = deliveries.filter(delivery => delivery.status === 'delivered');
    
    const filteredDeliveries = filterDeliveriesByPeriod(completedDeliveries, activeFilter);
    
    return groupDeliveriesByDate(filteredDeliveries);
  }, [deliveries, activeFilter]);
  
  const globalStats = useMemo(() => {
    return calculateHistoryStats(deliveries, groupedDeliveries);
  }, [deliveries, groupedDeliveries]);

  return {
    groupedDeliveries,
    globalStats,
    periodDeliveries: groupedDeliveries
  };
};
