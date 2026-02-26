import { useState, useEffect } from 'react';

/**
 * Hook personnalisé pour gérer les livraisons récentes
 * @param {Array} deliveries - Liste complète des livraisons
 * @param {Object} options - Options de filtrage
 * @param {number} options.days - Nombre de jours à remonter (défaut: 7)
 * @param {number} options.limit - Nombre maximum de livraisons (défaut: 10)
 * @param {string} options.status - Statut des livraisons à filtrer (défaut: 'delivered')
 * @returns {Array} Livraisons récentes filtrées et triées
 */
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


