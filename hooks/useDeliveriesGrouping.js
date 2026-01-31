import { useMemo } from 'react';
import {
  filterDeliveriesByPeriod,
  groupDeliveriesByDate,
  calculateHistoryStats
} from '../utils/dateUtils';

/**
 * Hook personnalisé pour gérer le groupement et les statistiques des livraisons
 * @param {Array} deliveries - Liste des livraisons
 * @param {string} activeFilter - Filtre temporel actif
 * @returns {Object} Livraisons groupées et statistiques
 */
export const useDeliveriesGrouping = (deliveries, activeFilter = 'all') => {
  const groupedDeliveries = useMemo(() => {
    // Filtrer les livraisons terminées
    const completedDeliveries = deliveries.filter(delivery => delivery.status === 'delivered');

    // Appliquer le filtre temporel
    const filteredDeliveries = filterDeliveriesByPeriod(completedDeliveries, activeFilter);

    // Grouper par date
    return groupDeliveriesByDate(filteredDeliveries);
  }, [deliveries, activeFilter]);

  // Statistiques globales
  const globalStats = useMemo(() => {
    return calculateHistoryStats(deliveries, groupedDeliveries);
  }, [deliveries, groupedDeliveries]);

  return {
    groupedDeliveries,
    globalStats,
    periodDeliveries: groupedDeliveries
  };
};
