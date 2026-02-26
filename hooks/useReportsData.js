import { useMemo } from 'react';

/**
 * Hook personnalisé pour gérer les données des rapports
 * @param {Array} deliveries - Liste des livraisons
 * @param {Object} stats - Statistiques du driver
 * @param {string} activePeriod - Période active ('7days', '30days', '90days')
 * @returns {Object} Données calculées pour les rapports
 */
export const useReportsData = (deliveries, stats, activePeriod) => {
  // Périodes disponibles
  const periods = useMemo(() => [
    { key: '7days', label: 'Last 7 Days', days: 7 },
    { key: '30days', label: 'Last 30 Days', days: 30 },
    { key: '90days', label: 'Last 90 Days', days: 90 },
  ], []);

  // Filtrer les livraisons selon la période
  const periodDeliveries = useMemo(() => {
    const period = periods.find(p => p.key === activePeriod);
    if (!period) return deliveries;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - period.days);

    return deliveries.filter(delivery =>
      new Date(delivery.createdAt || delivery.updatedAt) >= cutoffDate
    );
  }, [deliveries, activePeriod, periods]);

  // Statistiques de performance
  const performanceStats = useMemo(() => {
    const completedDeliveries = periodDeliveries.filter(d => d.status === 'delivered');
    const totalRevenue = completedDeliveries.reduce((sum, d) => sum + (d.delivery?.deliveryFee || 0), 0);
    const totalDeliveries = completedDeliveries.length;

    // Calculer les moyennes par jour
    const daysInPeriod = periods.find(p => p.key === activePeriod)?.days || 30;
    const avgDeliveriesPerDay = totalDeliveries / daysInPeriod;
    const avgRevenuePerDay = totalRevenue / daysInPeriod;

    // Trouver le meilleur et pire jour
    const dailyStats = {};
    completedDeliveries.forEach(delivery => {
      const date = new Date(delivery.createdAt || delivery.updatedAt).toDateString();
      if (!dailyStats[date]) {
        dailyStats[date] = { deliveries: 0, revenue: 0 };
      }
      dailyStats[date].deliveries += 1;
      dailyStats[date].revenue += delivery.delivery?.deliveryFee || 0;
    });

    const dailyArray = Object.values(dailyStats);
    const bestDay = dailyArray.reduce((best, day) =>
      day.revenue > best.revenue ? day : best, { revenue: 0 });
    const worstDay = dailyArray.reduce((worst, day) =>
      day.revenue < worst.revenue ? day : worst, { revenue: Infinity });

    // Taux de réussite
    const completionRate = deliveries.length > 0
      ? (completedDeliveries.length / deliveries.length) * 100
      : 0;

    return {
      totalRevenue,
      totalDeliveries,
      avgDeliveriesPerDay,
      avgRevenuePerDay,
      bestDay,
      worstDay: worstDay.revenue === Infinity ? { revenue: 0 } : worstDay,
      completionRate,
      avgRating: stats.rating || 0
    };
  }, [periodDeliveries, deliveries, stats, activePeriod, periods]);

  // Statistiques de tendance (comparaison avec période précédente)
  const trendStats = useMemo(() => {
    const currentPeriod = periods.find(p => p.key === activePeriod);
    if (!currentPeriod) return null;

    const currentStats = performanceStats;

    // Période précédente (même durée)
    const prevCutoffDate = new Date();
    prevCutoffDate.setDate(prevCutoffDate.getDate() - (currentPeriod.days * 2));

    const prevDeliveries = deliveries.filter(delivery => {
      const date = new Date(delivery.createdAt || delivery.updatedAt);
      return date >= prevCutoffDate && date < new Date(Date.now() - currentPeriod.days * 24 * 60 * 60 * 1000);
    });

    const prevCompletedDeliveries = prevDeliveries.filter(d => d.status === 'delivered');
    const prevRevenue = prevCompletedDeliveries.reduce((sum, d) => sum + (d.delivery?.deliveryFee || 0), 0);
    const prevCount = prevCompletedDeliveries.length;

    const revenueChange = prevRevenue > 0 ? ((currentStats.totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const deliveriesChange = prevCount > 0 ? ((currentStats.totalDeliveries - prevCount) / prevCount) * 100 : 0;

    return {
      revenueChange,
      deliveriesChange,
      prevRevenue,
      prevDeliveries: prevCount
    };
  }, [performanceStats, deliveries, activePeriod, periods]);

  return {
    periods,
    periodDeliveries,
    performanceStats,
    trendStats
  };
};


