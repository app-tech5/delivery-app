import { useState } from 'react';
import apiClient from '../api';
import { loadDriverStatsWithSmartCache, clearDriverStatsCache } from '../utils/cacheUtils';
import { isDriverAuthenticated, INITIAL_STATS } from '../utils/driverUtils';

/**
 * Hook personnalisé pour gérer les statistiques du driver
 * @param {Object} driver - Objet driver
 * @param {boolean} isAuthenticated - État d'authentification
 * @returns {Object} État et fonctions des statistiques
 */
export const useDriverStats = (driver, isAuthenticated) => {
  const [stats, setStats] = useState(INITIAL_STATS);

  // Charger les statistiques du driver avec cache intelligent
  const loadDriverStats = async () => {
    if (!isAuthenticated || !driver?._id) {
      console.log('❌ Driver non authentifié, impossible de charger les stats');
      return;
    }

    try {
      // Utiliser le cache intelligent pour les stats
      await loadDriverStatsWithSmartCache(
        driver._id, // driverId
        () => apiClient.getDriverStats(), // apiFetcher
        (data, fromCache) => {
          // onDataLoaded - appelé quand les données sont prêtes (cache ou API)
          setStats(data);
          if (fromCache) {
            console.log('🔄 Stats chargées depuis le cache dans DriverContext');
          }
        },
        (data) => {
          // onDataUpdated - appelé quand les données sont mises à jour depuis l'API
          setStats(data);
          console.log('🔄 Stats mises à jour depuis l\'API dans DriverContext');
        },
        (loading) => {
          // onLoadingStateChange - on pourrait utiliser un état de chargement spécifique
          console.log(`🔄 État de chargement des stats: ${loading}`);
        },
        (errorMsg) => {
          // onError
          console.error('Erreur chargement stats:', errorMsg);
        }
      );
    } catch (error) {
      console.error('Error loading driver stats with smart cache:', error);
    }
  };

  // Invalider le cache des stats (pour forcer un rechargement)
  const invalidateDriverStatsCache = async () => {
    if (driver?._id) {
      try {
        await clearDriverStatsCache(driver._id);
        console.log('🗑️ Cache des stats invalidé');
        await loadDriverStats(); // Recharger immédiatement
      } catch (error) {
        console.error('Erreur lors de l\'invalidation du cache des stats:', error);
      }
    }
  };

  return {
    stats,
    loadDriverStats,
    invalidateDriverStatsCache
  };
};


