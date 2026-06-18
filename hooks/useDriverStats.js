import { useState, useEffect } from 'react';
import apiClient from '../api';
import { loadDriverStatsWithSmartCache, clearDriverStatsCache } from '../utils/cacheUtils';
import { isDriverAuthenticated, INITIAL_STATS } from '../utils/driverUtils';

export const useDriverStats = (driver, hasCompletedOnboarding) => {
  const [stats, setStats] = useState(INITIAL_STATS);

  useEffect(() => {
    if (!hasCompletedOnboarding) {
      setStats(INITIAL_STATS);
    }
  }, [hasCompletedOnboarding]);

  const loadDriverStats = async () => {
    if (!hasCompletedOnboarding || !driver?._id) {
      console.log('❌ Driver non authentifié, impossible de charger les stats');
      return;
    }

    try {
      
      await loadDriverStatsWithSmartCache(
        driver._id, 
        () => apiClient.getDriverStats(), 
        (data, fromCache) => {
          
          setStats(data);
          if (fromCache) {
            console.log('🔄 Stats chargées depuis le cache dans DriverContext');
          }
        },
        (data) => {
          
          setStats(data);
          console.log('🔄 Stats mises à jour depuis l\'API dans DriverContext');
        },
        (loading) => {
          
          console.log(`🔄 État de chargement des stats: ${loading}`);
        },
        (errorMsg) => {
          
          console.error('Erreur chargement stats:', errorMsg);
        }
      );
    } catch (error) {
      console.error('Error loading driver stats with smart cache:', error);
    }
  };
  
  const invalidateDriverStatsCache = async () => {
    if (driver?._id) {
      try {
        await clearDriverStatsCache(driver._id);
        console.log('🗑️ Cache des stats invalidé');
        await loadDriverStats(); 
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

