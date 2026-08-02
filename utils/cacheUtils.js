import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearDriverCache } from './storageUtils';
import { DEMO_STORAGE_KEY } from '../api/demo/localStore';
import { clearDeliverySettingsCache } from './driverDeliveryFee';

const CACHE_KEYS = {
  SETTINGS: 'app_settings',
  DRIVER_DELIVERIES: 'driver_deliveries',
  DRIVER_STATS: 'driver_stats',
  PAYMENT_METHODS: 'payment_methods',
  NEARBY_RESTAURANTS: 'nearby_restaurants',
  CACHE_TIMESTAMP: '_timestamp',
  CACHE_VERSION: 'cache_version'
};

const CACHE_CONFIG = {
  VERSION: '1.0'
};

export const hasSettingsChanged = (oldSettings, newSettings) => {
  if (!oldSettings || !newSettings) return true;
  
  const oldCurrency = oldSettings.currency?.symbol || '';
  const newCurrency = newSettings.currency?.symbol || '';
  const oldLanguage = oldSettings.language?.code || '';
  const newLanguage = newSettings.language?.code || '';

  return oldCurrency !== newCurrency || oldLanguage !== newLanguage;
};

export const hasDeliveriesChanged = (oldDeliveries, newDeliveries) => {
  if (!oldDeliveries || !newDeliveries) return true;
  if (oldDeliveries.length !== newDeliveries.length) return true;
  
  const oldIds = oldDeliveries.map(delivery => `${delivery._id}_${delivery.status}_${delivery.updatedAt || delivery.createdAt}`);
  const newIds = newDeliveries.map(delivery => `${delivery._id}_${delivery.status}_${delivery.updatedAt || delivery.createdAt}`);

  return JSON.stringify(oldIds.sort()) !== JSON.stringify(newIds.sort());
};

export const hasDriverStatsChanged = (oldStats, newStats) => {
  if (!oldStats || !newStats) return true;
  
  const oldValues = `${oldStats.todayDeliveries || 0}_${oldStats.totalEarnings || 0}_${oldStats.rating || 0}_${oldStats.completedOrders || 0}`;
  const newValues = `${newStats.todayDeliveries || 0}_${newStats.totalEarnings || 0}_${newStats.rating || 0}_${newStats.completedOrders || 0}`;

  return oldValues !== newValues;
};

export const hasNearbyRestaurantsChanged = (oldRestaurants, newRestaurants) => {
  if (!oldRestaurants || !newRestaurants) return true;
  if (oldRestaurants.length !== newRestaurants.length) return true;
  
  const oldIds = oldRestaurants.map(r => `${r._id || r.id}_${r.distance?.toFixed(1) || 'N/A'}`);
  const newIds = newRestaurants.map(r => `${r._id || r.id}_${r.distance?.toFixed(1) || 'N/A'}`);

  return JSON.stringify(oldIds.sort()) !== JSON.stringify(newIds.sort());
};

export const saveSettingsToCache = async (settings) => {
  try {
    if (!settings) {
      return;
    }

    const cacheKey = CACHE_KEYS.SETTINGS;
    const timestampKey = CACHE_KEYS.SETTINGS + CACHE_KEYS.CACHE_TIMESTAMP;

    const cacheData = {
      settings,
      version: CACHE_CONFIG.VERSION,
      timestamp: Date.now()
    };

    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    await AsyncStorage.setItem(timestampKey, cacheData.timestamp.toString());

  } catch (error) {
  }
};

export const saveDeliveriesToCache = async (deliveries, driverId) => {
  try {
    if (!deliveries || !Array.isArray(deliveries) || !driverId) {
      return;
    }

    const cacheKey = `${CACHE_KEYS.DRIVER_DELIVERIES}_${driverId}`;
    const timestampKey = `${CACHE_KEYS.DRIVER_DELIVERIES}_${driverId}${CACHE_KEYS.CACHE_TIMESTAMP}`;

    const cacheData = {
      deliveries,
      version: CACHE_CONFIG.VERSION,
      timestamp: Date.now(),
      driverId
    };

    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    await AsyncStorage.setItem(timestampKey, cacheData.timestamp.toString());

  } catch (error) {
  }
};

export const saveDriverStatsToCache = async (stats, driverId) => {
  try {
    if (!stats || !driverId) {
      return;
    }

    const cacheKey = `${CACHE_KEYS.DRIVER_STATS}_${driverId}`;
    const timestampKey = `${CACHE_KEYS.DRIVER_STATS}_${driverId}${CACHE_KEYS.CACHE_TIMESTAMP}`;

    const cacheData = {
      stats,
      version: CACHE_CONFIG.VERSION,
      timestamp: Date.now(),
      driverId
    };

    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    await AsyncStorage.setItem(timestampKey, cacheData.timestamp.toString());

  } catch (error) {
  }
};

export const saveNearbyRestaurantsToCache = async (restaurants, latitude, longitude, radius = 10) => {
  try {
    if (!restaurants || !Array.isArray(restaurants)) {
      return;
    }

    const locationKey = `${latitude.toFixed(4)}_${longitude.toFixed(4)}_${radius}`;
    const cacheKey = `${CACHE_KEYS.NEARBY_RESTAURANTS}_${locationKey}`;
    const timestampKey = `${CACHE_KEYS.NEARBY_RESTAURANTS}_${locationKey}${CACHE_KEYS.CACHE_TIMESTAMP}`;

    const cacheData = {
      restaurants,
      location: { latitude, longitude, radius },
      version: CACHE_CONFIG.VERSION,
      timestamp: Date.now()
    };

    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    await AsyncStorage.setItem(timestampKey, cacheData.timestamp.toString());
  } catch (error) {
  }
};

export const getSettingsFromCache = async () => {
  try {
    const cacheKey = CACHE_KEYS.SETTINGS;
    const timestampKey = CACHE_KEYS.SETTINGS + CACHE_KEYS.CACHE_TIMESTAMP;

    const cachedData = await AsyncStorage.getItem(cacheKey);
    const timestamp = await AsyncStorage.getItem(timestampKey);

    if (!cachedData) {
      return null;
    }

    const parsedData = JSON.parse(cachedData);
    
    if (parsedData.version !== CACHE_CONFIG.VERSION) {
      await clearSettingsCache();
      return null;
    }

    return {
      settings: parsedData.settings,
      timestamp: parsedData.timestamp,
      fromCache: true
    };

  } catch (error) {
    return null;
  }
};

export const getDeliveriesFromCache = async (driverId) => {
  try {
    if (!driverId) {
      return null;
    }

    const cacheKey = `${CACHE_KEYS.DRIVER_DELIVERIES}_${driverId}`;
    const timestampKey = `${CACHE_KEYS.DRIVER_DELIVERIES}_${driverId}${CACHE_KEYS.CACHE_TIMESTAMP}`;

    const cachedData = await AsyncStorage.getItem(cacheKey);
    const timestamp = await AsyncStorage.getItem(timestampKey);

    if (!cachedData) {
      return null;
    }

    const parsedData = JSON.parse(cachedData);
    
    if (parsedData.version !== CACHE_CONFIG.VERSION) {
      await clearDeliveriesCache(driverId);
      return null;
    }

    return {
      deliveries: parsedData.deliveries,
      timestamp: parsedData.timestamp,
      fromCache: true
    };

  } catch (error) {
    return null;
  }
};

export const getDriverStatsFromCache = async (driverId) => {
  try {
    if (!driverId) {
      return null;
    }

    const cacheKey = `${CACHE_KEYS.DRIVER_STATS}_${driverId}`;
    const timestampKey = `${CACHE_KEYS.DRIVER_STATS}_${driverId}${CACHE_KEYS.CACHE_TIMESTAMP}`;

    const cachedData = await AsyncStorage.getItem(cacheKey);

    if (!cachedData) {
      return null;
    }

    const parsedData = JSON.parse(cachedData);
    
    if (parsedData.version !== CACHE_CONFIG.VERSION) {
      await clearDriverStatsCache(driverId);
      return null;
    }

    return {
      stats: parsedData.stats,
      timestamp: parsedData.timestamp,
      fromCache: true
    };

  } catch (error) {
    return null;
  }
};

export const getNearbyRestaurantsFromCache = async (latitude, longitude, radius = 10) => {
  try {
    const locationKey = `${latitude.toFixed(4)}_${longitude.toFixed(4)}_${radius}`;
    const cacheKey = `${CACHE_KEYS.NEARBY_RESTAURANTS}_${locationKey}`;
    const timestampKey = `${CACHE_KEYS.NEARBY_RESTAURANTS}_${locationKey}${CACHE_KEYS.CACHE_TIMESTAMP}`;

    const cachedData = await AsyncStorage.getItem(cacheKey);

    if (!cachedData) {
      return null;
    }

    const parsedData = JSON.parse(cachedData);
    
    if (parsedData.version !== CACHE_CONFIG.VERSION) {
      await clearNearbyRestaurantsCache(latitude, longitude, radius);
      return null;
    }

    return {
      restaurants: parsedData.restaurants,
      timestamp: parsedData.timestamp,
      fromCache: true
    };

  } catch (error) {
    return null;
  }
};

export const clearSettingsCache = async () => {
  try {
    const cacheKey = CACHE_KEYS.SETTINGS;
    const timestampKey = CACHE_KEYS.SETTINGS + CACHE_KEYS.CACHE_TIMESTAMP;

    await AsyncStorage.removeItem(cacheKey);
    await AsyncStorage.removeItem(timestampKey);

  } catch (error) {
  }
};

export const clearDeliveriesCache = async (driverId) => {
  try {
    if (!driverId) {
      return;
    }

    const cacheKey = `${CACHE_KEYS.DRIVER_DELIVERIES}_${driverId}`;
    const timestampKey = `${CACHE_KEYS.DRIVER_DELIVERIES}_${driverId}${CACHE_KEYS.CACHE_TIMESTAMP}`;

    await AsyncStorage.removeItem(cacheKey);
    await AsyncStorage.removeItem(timestampKey);

  } catch (error) {
  }
};

export const clearDriverStatsCache = async (driverId) => {
  try {
    if (!driverId) {
      return;
    }

    const cacheKey = `${CACHE_KEYS.DRIVER_STATS}_${driverId}`;
    const timestampKey = `${CACHE_KEYS.DRIVER_STATS}_${driverId}${CACHE_KEYS.CACHE_TIMESTAMP}`;

    await AsyncStorage.removeItem(cacheKey);
    await AsyncStorage.removeItem(timestampKey);

  } catch (error) {
  }
};

export const clearNearbyRestaurantsCache = async (latitude, longitude, radius = 10) => {
  try {
    const locationKey = `${latitude.toFixed(4)}_${longitude.toFixed(4)}_${radius}`;
    const cacheKey = `${CACHE_KEYS.NEARBY_RESTAURANTS}_${locationKey}`;
    const timestampKey = `${CACHE_KEYS.NEARBY_RESTAURANTS}_${locationKey}${CACHE_KEYS.CACHE_TIMESTAMP}`;

    await AsyncStorage.removeItem(cacheKey);
    await AsyncStorage.removeItem(timestampKey);
  } catch (error) {
  }
};

export const loadSettingsWithSmartCache = async (
  apiFetcher,
  onDataLoaded,
  onDataUpdated,
  onLoadingStateChange,
  onError
) => {
  try {
    
    onLoadingStateChange?.(true);
    const cachedData = await getSettingsFromCache();

    if (cachedData && cachedData.settings) {
      onDataLoaded(cachedData.settings, true); 
      onLoadingStateChange?.(false);
    } else {
      onLoadingStateChange?.(true);
    }
    
    const freshData = await apiFetcher();

    if (freshData) {
      
      const appSettings = Array.isArray(freshData) ? freshData[0] : freshData;
      
      const hasChanged = !cachedData || hasSettingsChanged(cachedData.settings, appSettings);

      if (hasChanged) {
        
        await saveSettingsToCache(appSettings);
        
        onDataUpdated(appSettings);
      } else {
      }
    } else {
      onError?.('Données settings invalides');
    }
    
    onLoadingStateChange?.(false);

  } catch (error) {
    onLoadingStateChange?.(false);
    onError?.(error.message);
    
    const fallbackCache = await getSettingsFromCache();
    if (fallbackCache && fallbackCache.settings) {
      onDataLoaded(fallbackCache.settings, true);
    } else {
      
      const defaultSettings = {
        appName: 'Good Food Pro Driver',
        currency: {
          value: 'EUR',
          label: 'Euro',
          symbol: '€',
          code: 'EUR'
        },
        language: {
          code: 'fr',
          isDefault: true,
          name: 'Français'
        }
      };
      onDataLoaded(defaultSettings, false);
    }
  }
};

export const loadDeliveriesWithSmartCache = async (
  driverId,
  apiFetcher,
  onDataLoaded,
  onDataUpdated,
  onLoadingStateChange,
  onError
) => {
  if (!driverId) {
    onError?.('DriverId requis');
    return;
  }

  try {
    
    onLoadingStateChange?.(true);
    const cachedData = await getDeliveriesFromCache(driverId);

    if (cachedData && cachedData.deliveries) {
      onDataLoaded(cachedData.deliveries, true); 
      onLoadingStateChange?.(false);
    } else {
      onLoadingStateChange?.(true);
    }
    
    const freshData = await apiFetcher();

    if (freshData && Array.isArray(freshData)) {
      
      const hasChanged = !cachedData || hasDeliveriesChanged(cachedData.deliveries, freshData);

      if (hasChanged) {
        
        await saveDeliveriesToCache(freshData, driverId);
        
        onDataUpdated(freshData);
      } else {
      }
    } else {
      onError?.('Données livraisons invalides');
    }
    
    onLoadingStateChange?.(false);

  } catch (error) {
    onLoadingStateChange?.(false);
    onError?.(error.message);
    
    const fallbackCache = await getDeliveriesFromCache(driverId);
    if (fallbackCache && fallbackCache.deliveries) {
      onDataLoaded(fallbackCache.deliveries, true);
    } else {
      
      onDataLoaded([], false);
    }
  }
};

export const loadDriverStatsWithSmartCache = async (
  driverId,
  apiFetcher,
  onDataLoaded,
  onDataUpdated,
  onLoadingStateChange,
  onError
) => {
  if (!driverId) {
    onError?.('DriverId requis');
    return;
  }

  try {
    
    onLoadingStateChange?.(true);
    const cachedData = await getDriverStatsFromCache(driverId);

    if (cachedData && cachedData.stats) {
      onDataLoaded(cachedData.stats, true); 
      onLoadingStateChange?.(false);
    } else {
      onLoadingStateChange?.(true);
    }
    
    const freshData = await apiFetcher();

    if (freshData) {
      
      const hasChanged = !cachedData || hasDriverStatsChanged(cachedData.stats, freshData);

      if (hasChanged) {
        
        await saveDriverStatsToCache(freshData, driverId);
        
        onDataUpdated(freshData);
      } else {
      }
    } else {
      onError?.('Données stats invalides');
    }
    
    onLoadingStateChange?.(false);

  } catch (error) {
    onLoadingStateChange?.(false);
    onError?.(error.message);
    
    const fallbackCache = await getDriverStatsFromCache(driverId);
    if (fallbackCache && fallbackCache.stats) {
      onDataLoaded(fallbackCache.stats, true);
    } else {
      
      const defaultStats = {
        todayDeliveries: 0,
        totalEarnings: 0,
        rating: 0,
        completedOrders: 0
      };
      onDataLoaded(defaultStats, false);
    }
  }
};

export const setPaymentMethodsCache = async (userId, paymentMethods) => {
  try {
    if (!userId) {
      return;
    }

    const cacheKey = `${CACHE_KEYS.PAYMENT_METHODS}_${userId}`;
    const timestampKey = `${CACHE_KEYS.PAYMENT_METHODS}_${userId}${CACHE_KEYS.CACHE_TIMESTAMP}`;

    const cacheData = {
      paymentMethods,
      timestamp: Date.now(),
      version: CACHE_CONFIG.VERSION
    };

    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    await AsyncStorage.setItem(timestampKey, Date.now().toString());

  } catch (error) {
  }
};

export const getPaymentMethodsFromCache = async (userId) => {
  try {
    if (!userId) {
      return null;
    }

    const cacheKey = `${CACHE_KEYS.PAYMENT_METHODS}_${userId}`;
    const timestampKey = `${CACHE_KEYS.PAYMENT_METHODS}_${userId}${CACHE_KEYS.CACHE_TIMESTAMP}`;

    const cachedData = await AsyncStorage.getItem(cacheKey);

    if (!cachedData) {
      return null;
    }

    const parsedData = JSON.parse(cachedData);
    
    if (parsedData.version !== CACHE_CONFIG.VERSION) {
      await clearPaymentMethodsCache(userId);
      return null;
    }

    return {
      paymentMethods: parsedData.paymentMethods,
      timestamp: parsedData.timestamp,
      fromCache: true
    };

  } catch (error) {
    return null;
  }
};

export const clearPaymentMethodsCache = async (userId) => {
  try {
    if (!userId) {
      return;
    }

    const cacheKey = `${CACHE_KEYS.PAYMENT_METHODS}_${userId}`;
    const timestampKey = `${CACHE_KEYS.PAYMENT_METHODS}_${userId}${CACHE_KEYS.CACHE_TIMESTAMP}`;

    await AsyncStorage.removeItem(cacheKey);
    await AsyncStorage.removeItem(timestampKey);

  } catch (error) {
  }
};

const clearCachesByPrefix = async (prefix) => {
  const keys = await AsyncStorage.getAllKeys();
  const matching = keys.filter((key) => key.startsWith(prefix));
  if (matching.length) {
    await AsyncStorage.multiRemove(matching);
  }
};

export const clearAllLocalAppDataOnLogout = async () => {
  try {
    const cachePrefixes = [
      CACHE_KEYS.DRIVER_DELIVERIES,
      CACHE_KEYS.DRIVER_STATS,
      CACHE_KEYS.PAYMENT_METHODS,
      CACHE_KEYS.NEARBY_RESTAURANTS,
      CACHE_KEYS.SETTINGS,
    ];

    await Promise.all(cachePrefixes.map((prefix) => clearCachesByPrefix(prefix)));

    await AsyncStorage.multiRemove([
      CACHE_KEYS.CACHE_VERSION,
      DEMO_STORAGE_KEY,
    ]);

    await clearDriverCache();
    clearDeliverySettingsCache();

  } catch (error) {
    throw error;
  }
};

export const clearAllDriverSessionCaches = clearAllLocalAppDataOnLogout;

export const loadPaymentMethodsWithCache = async (
  userId,
  apiFetcher,
  onDataLoaded,
  onDataUpdated,
  onLoadingStateChange,
  onError
) => {
  if (!userId) {
    onError?.('UserId requis');
    return;
  }

  try {
    
    onLoadingStateChange?.(true);
    const cachedData = await getPaymentMethodsFromCache(userId);

    if (cachedData) {
      
      onDataLoaded(cachedData.paymentMethods, true);
      
      const cacheAge = Date.now() - cachedData.timestamp;
      const CACHE_DURATION = 5 * 60 * 1000; 

      if (cacheAge < CACHE_DURATION) {
        onLoadingStateChange?.(false);
        return;
      }
    }
    
    const apiData = await apiFetcher();
    
    await setPaymentMethodsCache(userId, apiData);

    if (cachedData) {
      
      const hasChanged = JSON.stringify(cachedData.paymentMethods) !== JSON.stringify(apiData);
      if (hasChanged) {
        onDataUpdated?.(apiData);
      } else {
      }
    } else {
      
      onDataLoaded(apiData, false);
    }

    onLoadingStateChange?.(false);

  } catch (error) {
    onError?.(error.message || 'Erreur de chargement');
    
    const fallbackCache = await getPaymentMethodsFromCache(userId);
    if (fallbackCache) {
      onDataLoaded(fallbackCache.paymentMethods, true);
    } else {
      
      onDataLoaded([], false);
    }

    onLoadingStateChange?.(false);
  }
};

export const loadNearbyRestaurantsWithSmartCache = async (
  latitude,
  longitude,
  radius,
  apiFetcher,
  onDataLoaded,
  onDataUpdated,
  onLoadingStateChange,
  onError
) => {
  if (!latitude || !longitude) {
    onError?.('Coordonnées requises');
    return;
  }

  try {
    onLoadingStateChange?.(true);
    const cachedData = await getNearbyRestaurantsFromCache(latitude, longitude, radius);

    if (cachedData && cachedData.restaurants) {
      onDataLoaded(cachedData.restaurants, true);
      onLoadingStateChange?.(false);
    } else {
      onLoadingStateChange?.(true);
    }

    const freshData = await apiFetcher(latitude, longitude, radius);

    if (freshData && Array.isArray(freshData)) {
      const hasChanged = !cachedData || hasNearbyRestaurantsChanged(cachedData.restaurants, freshData);

      if (hasChanged) {
        await saveNearbyRestaurantsToCache(freshData, latitude, longitude, radius);
        onDataUpdated(freshData);
      }
    } else {
      onError?.('Données restaurants invalides');
    }

    onLoadingStateChange?.(false);

  } catch (error) {
    onLoadingStateChange?.(false);
    onError?.(error.message);

    const fallbackCache = await getNearbyRestaurantsFromCache(latitude, longitude, radius);
    if (fallbackCache && fallbackCache.restaurants) {
      onDataLoaded(fallbackCache.restaurants, true);
    } else {
      onDataLoaded([], false);
    }
  }
};

