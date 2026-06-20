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
      console.warn('⚠️ Tentative de sauvegarde de settings invalides en cache');
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

    console.log(`💾 Settings sauvegardés en cache: ${settings.appName || 'App'}`);
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde des settings en cache:', error);
  }
};

export const saveDeliveriesToCache = async (deliveries, driverId) => {
  try {
    if (!deliveries || !Array.isArray(deliveries) || !driverId) {
      console.warn('⚠️ Tentative de sauvegarde de livraisons invalides en cache');
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

    console.log(`💾 Livraisons sauvegardées en cache pour driver ${driverId}: ${deliveries.length} livraisons`);
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde des livraisons en cache:', error);
  }
};

export const saveDriverStatsToCache = async (stats, driverId) => {
  try {
    if (!stats || !driverId) {
      console.warn('⚠️ Tentative de sauvegarde de stats invalides en cache');
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

    console.log(`💾 Stats sauvegardées en cache pour driver ${driverId}: ${stats.todayDeliveries || 0} livraisons aujourd'hui`);
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde des stats en cache:', error);
  }
};

export const saveNearbyRestaurantsToCache = async (restaurants, latitude, longitude, radius = 10) => {
  try {
    if (!restaurants || !Array.isArray(restaurants)) {
      console.warn('⚠️ Tentative de sauvegarde de restaurants invalides en cache');
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
    console.error('❌ Erreur lors de la sauvegarde des restaurants proches en cache:', error);
  }
};

export const getSettingsFromCache = async () => {
  try {
    const cacheKey = CACHE_KEYS.SETTINGS;
    const timestampKey = CACHE_KEYS.SETTINGS + CACHE_KEYS.CACHE_TIMESTAMP;

    const cachedData = await AsyncStorage.getItem(cacheKey);
    const timestamp = await AsyncStorage.getItem(timestampKey);

    if (!cachedData) {
      console.log(`📭 Pas de settings en cache`);
      return null;
    }

    const parsedData = JSON.parse(cachedData);
    
    if (parsedData.version !== CACHE_CONFIG.VERSION) {
      console.log(`🔄 Version du cache des settings obsolète, suppression`);
      await clearSettingsCache();
      return null;
    }

    console.log(`📖 Settings chargés depuis le cache: ${parsedData.settings.appName || 'App'}`);
    return {
      settings: parsedData.settings,
      timestamp: parsedData.timestamp,
      fromCache: true
    };

  } catch (error) {
    console.error('❌ Erreur lors de la lecture du cache des settings:', error);
    return null;
  }
};

export const getDeliveriesFromCache = async (driverId) => {
  try {
    if (!driverId) {
      console.log('❌ DriverId requis pour récupérer le cache des livraisons');
      return null;
    }

    const cacheKey = `${CACHE_KEYS.DRIVER_DELIVERIES}_${driverId}`;
    const timestampKey = `${CACHE_KEYS.DRIVER_DELIVERIES}_${driverId}${CACHE_KEYS.CACHE_TIMESTAMP}`;

    const cachedData = await AsyncStorage.getItem(cacheKey);
    const timestamp = await AsyncStorage.getItem(timestampKey);

    if (!cachedData) {
      console.log(`📭 Pas de livraisons en cache pour driver ${driverId}`);
      return null;
    }

    const parsedData = JSON.parse(cachedData);
    
    if (parsedData.version !== CACHE_CONFIG.VERSION) {
      console.log(`🔄 Version du cache des livraisons obsolète pour driver ${driverId}, suppression`);
      await clearDeliveriesCache(driverId);
      return null;
    }

    console.log(`📖 Livraisons chargées depuis le cache pour driver ${driverId}: ${parsedData.deliveries.length} livraisons`);
    return {
      deliveries: parsedData.deliveries,
      timestamp: parsedData.timestamp,
      fromCache: true
    };

  } catch (error) {
    console.error('❌ Erreur lors de la lecture du cache des livraisons:', error);
    return null;
  }
};

export const getDriverStatsFromCache = async (driverId) => {
  try {
    if (!driverId) {
      console.log('❌ DriverId requis pour récupérer le cache des stats');
      return null;
    }

    const cacheKey = `${CACHE_KEYS.DRIVER_STATS}_${driverId}`;
    const timestampKey = `${CACHE_KEYS.DRIVER_STATS}_${driverId}${CACHE_KEYS.CACHE_TIMESTAMP}`;

    const cachedData = await AsyncStorage.getItem(cacheKey);

    if (!cachedData) {
      console.log(`📭 Pas de stats en cache pour driver ${driverId}`);
      return null;
    }

    const parsedData = JSON.parse(cachedData);
    
    if (parsedData.version !== CACHE_CONFIG.VERSION) {
      console.log(`🔄 Version du cache des stats obsolète pour driver ${driverId}, suppression`);
      await clearDriverStatsCache(driverId);
      return null;
    }

    console.log(`📖 Stats chargées depuis le cache pour driver ${driverId}: ${parsedData.stats.todayDeliveries || 0} livraisons aujourd'hui`);
    return {
      stats: parsedData.stats,
      timestamp: parsedData.timestamp,
      fromCache: true
    };

  } catch (error) {
    console.error('❌ Erreur lors de la lecture du cache des stats:', error);
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
    console.error('❌ Erreur lors de la lecture du cache des restaurants proches:', error);
    return null;
  }
};

export const clearSettingsCache = async () => {
  try {
    const cacheKey = CACHE_KEYS.SETTINGS;
    const timestampKey = CACHE_KEYS.SETTINGS + CACHE_KEYS.CACHE_TIMESTAMP;

    await AsyncStorage.removeItem(cacheKey);
    await AsyncStorage.removeItem(timestampKey);

    console.log(`🗑️ Cache des settings supprimé`);
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du cache des settings:', error);
  }
};

export const clearDeliveriesCache = async (driverId) => {
  try {
    if (!driverId) {
      console.log('❌ DriverId requis pour supprimer le cache des livraisons');
      return;
    }

    const cacheKey = `${CACHE_KEYS.DRIVER_DELIVERIES}_${driverId}`;
    const timestampKey = `${CACHE_KEYS.DRIVER_DELIVERIES}_${driverId}${CACHE_KEYS.CACHE_TIMESTAMP}`;

    await AsyncStorage.removeItem(cacheKey);
    await AsyncStorage.removeItem(timestampKey);

    console.log(`🗑️ Cache des livraisons supprimé pour driver ${driverId}`);
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du cache des livraisons:', error);
  }
};

export const clearDriverStatsCache = async (driverId) => {
  try {
    if (!driverId) {
      console.log('❌ DriverId requis pour supprimer le cache des stats');
      return;
    }

    const cacheKey = `${CACHE_KEYS.DRIVER_STATS}_${driverId}`;
    const timestampKey = `${CACHE_KEYS.DRIVER_STATS}_${driverId}${CACHE_KEYS.CACHE_TIMESTAMP}`;

    await AsyncStorage.removeItem(cacheKey);
    await AsyncStorage.removeItem(timestampKey);

    console.log(`🗑️ Cache des stats supprimé pour driver ${driverId}`);
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du cache des stats:', error);
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
    console.error('❌ Erreur lors de la suppression du cache des restaurants proches:', error);
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
    console.log(`🚀 Démarrage du chargement intelligent des settings`);
    
    onLoadingStateChange?.(true);
    const cachedData = await getSettingsFromCache();

    if (cachedData && cachedData.settings) {
      console.log('⚡ Settings affichés depuis le cache');
      onDataLoaded(cachedData.settings, true); 
      onLoadingStateChange?.(false);
    } else {
      console.log('📭 Pas de cache disponible, attente des données API');
      onLoadingStateChange?.(true);
    }
    
    console.log('🌐 Fetch API en arrière-plan pour les settings...');
    const freshData = await apiFetcher();

    if (freshData) {
      console.log(`📡 Settings API reçus`);
      
      const appSettings = Array.isArray(freshData) ? freshData[0] : freshData;
      
      const hasChanged = !cachedData || hasSettingsChanged(cachedData.settings, appSettings);

      if (hasChanged) {
        console.log('🔄 Settings mis à jour, sauvegarde en cache et affichage');
        
        await saveSettingsToCache(appSettings);
        
        onDataUpdated(appSettings);
      } else {
        console.log('✅ Settings identiques, pas de mise à jour nécessaire');
      }
    } else {
      console.warn('⚠️ Données settings API invalides ou vides');
      onError?.('Données settings invalides');
    }
    
    onLoadingStateChange?.(false);

  } catch (error) {
    console.error('❌ Erreur lors du chargement intelligent des settings:', error);
    onLoadingStateChange?.(false);
    onError?.(error.message);
    
    const fallbackCache = await getSettingsFromCache();
    if (fallbackCache && fallbackCache.settings) {
      console.log('🔄 Erreur API, utilisation du cache comme fallback');
      onDataLoaded(fallbackCache.settings, true);
    } else {
      
      console.log('🔄 Pas de cache disponible, utilisation des valeurs par défaut');
      const defaultSettings = {
        appName: 'Good Food Delivery',
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
    console.error('❌ DriverId requis pour le chargement des livraisons');
    onError?.('DriverId requis');
    return;
  }

  try {
    console.log(`🚀 Démarrage du chargement intelligent des livraisons pour driver ${driverId}`);
    
    onLoadingStateChange?.(true);
    const cachedData = await getDeliveriesFromCache(driverId);

    if (cachedData && cachedData.deliveries) {
      console.log('⚡ Livraisons affichées depuis le cache');
      onDataLoaded(cachedData.deliveries, true); 
      onLoadingStateChange?.(false);
    } else {
      console.log('📭 Pas de cache disponible, attente des données API');
      onLoadingStateChange?.(true);
    }
    
    console.log('🌐 Fetch API en arrière-plan pour les livraisons...');
    const freshData = await apiFetcher();

    if (freshData && Array.isArray(freshData)) {
      console.log(`📡 Livraisons API reçues: ${freshData.length} livraisons`);
      
      const hasChanged = !cachedData || hasDeliveriesChanged(cachedData.deliveries, freshData);

      if (hasChanged) {
        console.log('🔄 Livraisons mises à jour, sauvegarde en cache et affichage');
        
        await saveDeliveriesToCache(freshData, driverId);
        
        onDataUpdated(freshData);
      } else {
        console.log('✅ Livraisons identiques, pas de mise à jour nécessaire');
      }
    } else {
      console.warn('⚠️ Données livraisons API invalides ou vides');
      onError?.('Données livraisons invalides');
    }
    
    onLoadingStateChange?.(false);

  } catch (error) {
    console.error('❌ Erreur lors du chargement intelligent des livraisons:', error);
    onLoadingStateChange?.(false);
    onError?.(error.message);
    
    const fallbackCache = await getDeliveriesFromCache(driverId);
    if (fallbackCache && fallbackCache.deliveries) {
      console.log('🔄 Erreur API, utilisation du cache comme fallback');
      onDataLoaded(fallbackCache.deliveries, true);
    } else {
      
      console.log('🔄 Pas de cache disponible, utilisation d\'un tableau vide');
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
    console.error('❌ DriverId requis pour le chargement des stats');
    onError?.('DriverId requis');
    return;
  }

  try {
    console.log(`🚀 Démarrage du chargement intelligent des stats pour driver ${driverId}`);
    
    onLoadingStateChange?.(true);
    const cachedData = await getDriverStatsFromCache(driverId);

    if (cachedData && cachedData.stats) {
      console.log('⚡ Stats affichées depuis le cache');
      onDataLoaded(cachedData.stats, true); 
      onLoadingStateChange?.(false);
    } else {
      console.log('📭 Pas de cache disponible, attente des données API');
      onLoadingStateChange?.(true);
    }
    
    console.log('🌐 Fetch API en arrière-plan pour les stats...');
    const freshData = await apiFetcher();

    if (freshData) {
      console.log(`📡 Stats API reçues`);
      
      const hasChanged = !cachedData || hasDriverStatsChanged(cachedData.stats, freshData);

      if (hasChanged) {
        console.log('🔄 Stats mises à jour, sauvegarde en cache et affichage');
        
        await saveDriverStatsToCache(freshData, driverId);
        
        onDataUpdated(freshData);
      } else {
        console.log('✅ Stats identiques, pas de mise à jour nécessaire');
      }
    } else {
      console.warn('⚠️ Données stats API invalides ou vides');
      onError?.('Données stats invalides');
    }
    
    onLoadingStateChange?.(false);

  } catch (error) {
    console.error('❌ Erreur lors du chargement intelligent des stats:', error);
    onLoadingStateChange?.(false);
    onError?.(error.message);
    
    const fallbackCache = await getDriverStatsFromCache(driverId);
    if (fallbackCache && fallbackCache.stats) {
      console.log('🔄 Erreur API, utilisation du cache comme fallback');
      onDataLoaded(fallbackCache.stats, true);
    } else {
      
      console.log('🔄 Pas de cache disponible, utilisation des stats par défaut');
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
      console.log('❌ UserId requis pour sauvegarder le cache des méthodes de paiement');
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

    console.log(`💾 Cache des méthodes de paiement sauvegardé pour user ${userId}: ${paymentMethods.length} méthodes`);
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde du cache des méthodes de paiement:', error);
  }
};

export const getPaymentMethodsFromCache = async (userId) => {
  try {
    if (!userId) {
      console.log('❌ UserId requis pour récupérer le cache des méthodes de paiement');
      return null;
    }

    const cacheKey = `${CACHE_KEYS.PAYMENT_METHODS}_${userId}`;
    const timestampKey = `${CACHE_KEYS.PAYMENT_METHODS}_${userId}${CACHE_KEYS.CACHE_TIMESTAMP}`;

    const cachedData = await AsyncStorage.getItem(cacheKey);

    if (!cachedData) {
      console.log(`📭 Pas de méthodes de paiement en cache pour user ${userId}`);
      return null;
    }

    const parsedData = JSON.parse(cachedData);
    
    if (parsedData.version !== CACHE_CONFIG.VERSION) {
      console.log(`🔄 Version du cache des méthodes de paiement obsolète pour user ${userId}, suppression`);
      await clearPaymentMethodsCache(userId);
      return null;
    }

    console.log(`📖 Méthodes de paiement chargées depuis le cache pour user ${userId}: ${parsedData.paymentMethods.length} méthodes`);
    return {
      paymentMethods: parsedData.paymentMethods,
      timestamp: parsedData.timestamp,
      fromCache: true
    };

  } catch (error) {
    console.error('❌ Erreur lors de la lecture du cache des méthodes de paiement:', error);
    return null;
  }
};

export const clearPaymentMethodsCache = async (userId) => {
  try {
    if (!userId) {
      console.log('❌ UserId requis pour supprimer le cache des méthodes de paiement');
      return;
    }

    const cacheKey = `${CACHE_KEYS.PAYMENT_METHODS}_${userId}`;
    const timestampKey = `${CACHE_KEYS.PAYMENT_METHODS}_${userId}${CACHE_KEYS.CACHE_TIMESTAMP}`;

    await AsyncStorage.removeItem(cacheKey);
    await AsyncStorage.removeItem(timestampKey);

    console.log(`🗑️ Cache des méthodes de paiement supprimé pour user ${userId}`);
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du cache des méthodes de paiement:', error);
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

    console.log('🗑️ Stockage local vidé après déconnexion');
  } catch (error) {
    console.error('❌ Erreur lors du vidage du stockage local:', error);
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
    console.error('❌ UserId requis pour le chargement des méthodes de paiement');
    onError?.('UserId requis');
    return;
  }

  try {
    console.log(`🚀 Démarrage du chargement intelligent des méthodes de paiement pour user ${userId}`);
    
    onLoadingStateChange?.(true);
    const cachedData = await getPaymentMethodsFromCache(userId);

    if (cachedData) {
      
      console.log('📱 Affichage des méthodes de paiement depuis le cache');
      onDataLoaded(cachedData.paymentMethods, true);
      
      const cacheAge = Date.now() - cachedData.timestamp;
      const CACHE_DURATION = 5 * 60 * 1000; 

      if (cacheAge < CACHE_DURATION) {
        console.log(`⏰ Cache des méthodes de paiement récent (${Math.round(cacheAge / 1000)}s), pas de rafraîchissement`);
        onLoadingStateChange?.(false);
        return;
      }
    }
    
    console.log('🌐 Fetch des méthodes de paiement depuis l\'API');
    const apiData = await apiFetcher();
    
    await setPaymentMethodsCache(userId, apiData);

    if (cachedData) {
      
      const hasChanged = JSON.stringify(cachedData.paymentMethods) !== JSON.stringify(apiData);
      if (hasChanged) {
        console.log('🔄 Méthodes de paiement mises à jour, notification du changement');
        onDataUpdated?.(apiData);
      } else {
        console.log('✅ Méthodes de paiement identiques, pas de mise à jour');
      }
    } else {
      
      console.log('📱 Affichage des méthodes de paiement depuis l\'API (pas de cache)');
      onDataLoaded(apiData, false);
    }

    onLoadingStateChange?.(false);

  } catch (error) {
    console.error('❌ Erreur lors du chargement intelligent des méthodes de paiement:', error);
    onError?.(error.message || 'Erreur de chargement');
    
    const fallbackCache = await getPaymentMethodsFromCache(userId);
    if (fallbackCache) {
      console.log('🔄 Erreur API, utilisation du cache comme fallback');
      onDataLoaded(fallbackCache.paymentMethods, true);
    } else {
      
      console.log('🔄 Pas de cache disponible, utilisation d\'un tableau vide');
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
    console.error('❌ Latitude et longitude requises pour le chargement des restaurants proches');
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
    console.error('❌ Erreur lors du chargement intelligent des restaurants proches:', error);
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

