import { useMemo } from 'react';
import { calculateDriverStatsFromDeliveries } from '../utils/driverDeliveryStats';
import { INITIAL_STATS } from '../utils/driverUtils';

export const useDriverStats = (driver, hasCompletedOnboarding, deliveries = []) => {
  const stats = useMemo(() => {
    if (!hasCompletedOnboarding) {
      return INITIAL_STATS;
    }

    return calculateDriverStatsFromDeliveries(deliveries, driver?.rating ?? 0);
  }, [deliveries, hasCompletedOnboarding, driver?.rating]);

  const loadDriverStats = async () => {
    if (!hasCompletedOnboarding || !driver?._id) {
      return;
    }
  };

  const invalidateDriverStatsCache = async () => {
    await loadDriverStats();
  };

  return {
    stats,
    loadDriverStats,
    invalidateDriverStatsCache,
  };
};
