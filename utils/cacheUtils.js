import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache keys pour delivery-app
const CACHE_KEYS = {
  SETTINGS: 'app_settings',
  DRIVER_DELIVERIES: 'driver_deliveries',
  DRIVER_STATS: 'driver_stats',
  NEARBY_RESTAURANTS: 'nearby_restaurants',
  CACHE_TIMESTAMP: '_timestamp',
  CACHE_VERSION: 'cache_version'
};

// Cache configuration pour delivery-app
const CACHE_CONFIG = {
  VERSION: '1.0'
};


/**
 * Compare deux objets settings pour voir s'ils sont différents
 * @param {Object} oldSettings - Anciens settings
 * @param {Object} newSettings - Nouveaux settings
 * @returns {boolean} True si les settings ont changé
 */
export const hasSettingsChanged = (oldSettings, newSettings) => {
  if (!oldSettings || !newSettings) return true;

  // Comparaison des propriétés principales
  const oldCurrency = oldSettings.currency?.symbol || '';
  const newCurrency = newSettings.currency?.symbol || '';
  const oldLanguage = oldSettings.language?.code || '';
  const newLanguage = newSettings.language?.code || '';

  return oldCurrency !== newCurrency || oldLanguage !== newLanguage;
};

/**
 * Compare deux listes de livraisons pour voir s'elles sont différentes
 * @param {Array} oldDeliveries - Anciennes livraisons
 * @param {Array} newDeliveries - Nouvelles livraisons
 * @returns {boolean} True si les livraisons ont changé
 */
export const hasDeliveriesChanged = (oldDeliveries, newDeliveries) => {
  if (!oldDeliveries || !newDeliveries) return true;
  if (oldDeliveries.length !== newDeliveries.length) return true;

  // Comparaison basée sur les IDs et statuts
  const oldIds = oldDeliveries.map(delivery => `${delivery._id}_${delivery.status}_${delivery.updatedAt || delivery.createdAt}`);
  const newIds = newDeliveries.map(delivery => `${delivery._id}_${delivery.status}_${delivery.updatedAt || delivery.createdAt}`);

  return JSON.stringify(oldIds.sort()) !== JSON.stringify(newIds.sort());
};

/**
 * Compare deux objets stats pour voir s'ils sont différents
 * @param {Object} oldStats - Anciennes stats
 * @param {Object} newStats - Nouvelles stats
 * @returns {boolean} True si les stats ont changé
 */
export const hasDriverStatsChanged = (oldStats, newStats) => {
  if (!oldStats || !newStats) return true;

  // Comparaison des valeurs principales des stats
  const oldValues = `${oldStats.todayDeliveries || 0}_${oldStats.totalEarnings || 0}_${oldStats.rating || 0}_${oldStats.completedOrders || 0}`;
  const newValues = `${newStats.todayDeliveries || 0}_${newStats.totalEarnings || 0}_${newStats.rating || 0}_${newStats.completedOrders || 0}`;

  return oldValues !== newValues;
};

/**
 * Compare deux listes de restaurants proches pour voir s'ils sont différents
 * @param {Array} oldRestaurants - Anciens restaurants
 * @param {Array} newRestaurants - Nouveaux restaurants
 * @returns {boolean} True si les restaurants ont changé
 */
export const hasNearbyRestaurantsChanged = (oldRestaurants, newRestaurants) => {
  if (!oldRestaurants || !newRestaurants) return true;
  if (oldRestaurants.length !== newRestaurants.length) return true;

  // Comparaison basée sur les IDs et distances
  const oldIds = oldRestaurants.map(r => `${r._id || r.id}_${r.distance?.toFixed(1) || 'N/A'}`);
  const newIds = newRestaurants.map(r => `${r._id || r.id}_${r.distance?.toFixed(1) || 'N/A'}`);

  return JSON.stringify(oldIds.sort()) !== JSON.stringify(newIds.sort());
};

/**
 * Sauvegarde les settings en cache
 * @param {Object} settings - Settings à sauvegarder
 */
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

/**
 * Sauvegarde les livraisons du driver en cache
 * @param {Array} deliveries - Livraisons à sauvegarder
 * @param {string} driverId - ID du driver pour identifier le cache
 */
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

/**
 * Sauvegarde les stats du driver en cache
 * @param {Object} stats - Stats à sauvegarder
 * @param {string} driverId - ID du driver pour identifier le cache
 */
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

/**
 * Sauvegarde les restaurants proches en cache
 * @param {Array} restaurants - Restaurants proches à sauvegarder
 * @param {number} latitude - Latitude du centre de recherche
 * @param {number} longitude - Longitude du centre de recherche
 * @param {number} radius - Rayon de recherche en km
 */
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

    console.log(`💾 Restaurants proches sauvegardés en cache: ${restaurants.length} restaurants (${locationKey})`);
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde des restaurants proches en cache:', error);
  }
};

/**
 * Récupère les settings depuis le cache
 * @returns {Object|null} Données du cache ou null
 */
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

    // Vérifier la version du cache
    if (parsedData.version !== CACHE_CONFIG.VERSION) {
      console.log(`🔄 Version du cache des settings obsolète, suppression`);
      await clearSettingsCache();
      return null;
    }

    // Le cache ne expire jamais - seulement invalidé manuellement ou si version changée

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

/**
 * Récupère les livraisons du driver depuis le cache
 * @param {string} driverId - ID du driver
 * @returns {Object|null} Données du cache ou null
 */
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

    // Vérifier la version du cache
    if (parsedData.version !== CACHE_CONFIG.VERSION) {
      console.log(`🔄 Version du cache des livraisons obsolète pour driver ${driverId}, suppression`);
      await clearDeliveriesCache(driverId);
      return null;
    }

    // Le cache ne expire jamais - seulement invalidé manuellement ou si version changée

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

/**
 * Récupère les stats du driver depuis le cache
 * @param {string} driverId - ID du driver
 * @returns {Object|null} Données du cache ou null
 */
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

    // Vérifier la version du cache
    if (parsedData.version !== CACHE_CONFIG.VERSION) {
      console.log(`🔄 Version du cache des stats obsolète pour driver ${driverId}, suppression`);
      await clearDriverStatsCache(driverId);
      return null;
    }

    // Le cache ne expire jamais - seulement invalidé manuellement ou si version changée

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

/**
 * Récupère les restaurants proches depuis le cache
 * @param {number} latitude - Latitude du centre de recherche
 * @param {number} longitude - Longitude du centre de recherche
 * @param {number} radius - Rayon de recherche en km
 * @returns {Object|null} Données du cache ou null
 */
export const getNearbyRestaurantsFromCache = async (latitude, longitude, radius = 10) => {
  try {
    const locationKey = `${latitude.toFixed(4)}_${longitude.toFixed(4)}_${radius}`;
    const cacheKey = `${CACHE_KEYS.NEARBY_RESTAURANTS}_${locationKey}`;
    const timestampKey = `${CACHE_KEYS.NEARBY_RESTAURANTS}_${locationKey}${CACHE_KEYS.CACHE_TIMESTAMP}`;

    const cachedData = await AsyncStorage.getItem(cacheKey);

    if (!cachedData) {
      console.log(`📭 Pas de restaurants proches en cache pour ${locationKey}`);
      return null;
    }

    const parsedData = JSON.parse(cachedData);

    // Vérifier la version du cache
    if (parsedData.version !== CACHE_CONFIG.VERSION) {
      console.log(`🔄 Version du cache des restaurants proches obsolète pour ${locationKey}, suppression`);
      await clearNearbyRestaurantsCache(latitude, longitude, radius);
      return null;
    }

    // Le cache ne expire jamais - seulement invalidé manuellement ou si version changée

    console.log(`📖 Restaurants proches chargés depuis le cache: ${parsedData.restaurants.length} restaurants (${locationKey})`);
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

/**
 * Supprime le cache des settings
 */
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

/**
 * Supprime le cache des livraisons pour un driver
 * @param {string} driverId - ID du driver
 */
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

/**
 * Supprime le cache des stats pour un driver
 * @param {string} driverId - ID du driver
 */
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

/**
 * Supprime le cache des restaurants proches
 * @param {number} latitude - Latitude du centre de recherche
 * @param {number} longitude - Longitude du centre de recherche
 * @param {number} radius - Rayon de recherche en km
 */
export const clearNearbyRestaurantsCache = async (latitude, longitude, radius = 10) => {
  try {
    const locationKey = `${latitude.toFixed(4)}_${longitude.toFixed(4)}_${radius}`;
    const cacheKey = `${CACHE_KEYS.NEARBY_RESTAURANTS}_${locationKey}`;
    const timestampKey = `${CACHE_KEYS.NEARBY_RESTAURANTS}_${locationKey}${CACHE_KEYS.CACHE_TIMESTAMP}`;

    await AsyncStorage.removeItem(cacheKey);
    await AsyncStorage.removeItem(timestampKey);

    console.log(`🗑️ Cache des restaurants proches supprimé pour ${locationKey}`);
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du cache des restaurants proches:', error);
  }
};

/**
 * Charge les settings avec un cache intelligent
 * 1. Lit d'abord le cache AsyncStorage
 * 2. Affiche immédiatement si disponible
 * 3. Fetch l'API en arrière-plan
 * 4. Met à jour si les données ont changé
 *
 * @param {Function} apiFetcher - Fonction pour fetch l'API (getSettings)
 * @param {Function} onDataLoaded - Callback quand les données sont prêtes (cache ou API)
 * @param {Function} onDataUpdated - Callback quand les données sont mises à jour depuis l'API
 * @param {Function} onLoadingStateChange - Callback pour l'état de chargement
 * @param {Function} onError - Callback en cas d'erreur
 */
export const loadSettingsWithSmartCache = async (
  apiFetcher,
  onDataLoaded,
  onDataUpdated,
  onLoadingStateChange,
  onError
) => {
  try {
    console.log(`🚀 Démarrage du chargement intelligent des settings`);

    // 1. Essayer de charger depuis le cache
    onLoadingStateChange?.(true);
    const cachedData = await getSettingsFromCache();

    if (cachedData && cachedData.settings) {
      console.log('⚡ Settings affichés depuis le cache');
      onDataLoaded(cachedData.settings, true); // true = fromCache
      onLoadingStateChange?.(false);
    } else {
      console.log('📭 Pas de cache disponible, attente des données API');
      onLoadingStateChange?.(true);
    }

    // 2. Fetch l'API en arrière-plan (toujours, même si cache disponible)
    console.log('🌐 Fetch API en arrière-plan pour les settings...');
    const freshData = await apiFetcher();

    if (freshData) {
      console.log(`📡 Settings API reçus`);

      // Normaliser les données (comme dans le contexte actuel)
      const appSettings = Array.isArray(freshData) ? freshData[0] : freshData;

      // 3. Vérifier si les données ont changé
      const hasChanged = !cachedData || hasSettingsChanged(cachedData.settings, appSettings);

      if (hasChanged) {
        console.log('🔄 Settings mis à jour, sauvegarde en cache et affichage');

        // Sauvegarder en cache
        await saveSettingsToCache(appSettings);

        // Mettre à jour l'affichage
        onDataUpdated(appSettings);
      } else {
        console.log('✅ Settings identiques, pas de mise à jour nécessaire');
      }
    } else {
      console.warn('⚠️ Données settings API invalides ou vides');
      onError?.('Données settings invalides');
    }

    // Fin du chargement
    onLoadingStateChange?.(false);

  } catch (error) {
    console.error('❌ Erreur lors du chargement intelligent des settings:', error);
    onLoadingStateChange?.(false);
    onError?.(error.message);

    // En cas d'erreur, essayer quand même d'utiliser le cache si disponible
    const fallbackCache = await getSettingsFromCache();
    if (fallbackCache && fallbackCache.settings) {
      console.log('🔄 Erreur API, utilisation du cache comme fallback');
      onDataLoaded(fallbackCache.settings, true);
    } else {
      // Si pas de cache, utiliser les valeurs par défaut
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

/**
 * Charge les livraisons du driver avec un cache intelligent
 * 1. Lit d'abord le cache AsyncStorage
 * 2. Affiche immédiatement si disponible
 * 3. Fetch l'API en arrière-plan
 * 4. Met à jour si les données ont changé
 *
 * @param {string} driverId - ID du driver
 * @param {Function} apiFetcher - Fonction pour fetch l'API (getDriverOrders)
 * @param {Function} onDataLoaded - Callback quand les données sont prêtes (cache ou API)
 * @param {Function} onDataUpdated - Callback quand les données sont mises à jour depuis l'API
 * @param {Function} onLoadingStateChange - Callback pour l'état de chargement
 * @param {Function} onError - Callback en cas d'erreur
 */
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

    // 1. Essayer de charger depuis le cache
    onLoadingStateChange?.(true);
    const cachedData = await getDeliveriesFromCache(driverId);

    if (cachedData && cachedData.deliveries) {
      console.log('⚡ Livraisons affichées depuis le cache');
      onDataLoaded(cachedData.deliveries, true); // true = fromCache
      onLoadingStateChange?.(false);
    } else {
      console.log('📭 Pas de cache disponible, attente des données API');
      onLoadingStateChange?.(true);
    }

    // 2. Fetch l'API en arrière-plan (toujours, même si cache disponible)
    console.log('🌐 Fetch API en arrière-plan pour les livraisons...');
    const freshData = await apiFetcher();

    if (freshData && Array.isArray(freshData)) {
      console.log(`📡 Livraisons API reçues: ${freshData.length} livraisons`);

      // 3. Vérifier si les données ont changé
      const hasChanged = !cachedData || hasDeliveriesChanged(cachedData.deliveries, freshData);

      if (hasChanged) {
        console.log('🔄 Livraisons mises à jour, sauvegarde en cache et affichage');

        // Sauvegarder en cache
        await saveDeliveriesToCache(freshData, driverId);

        // Mettre à jour l'affichage
        onDataUpdated(freshData);
      } else {
        console.log('✅ Livraisons identiques, pas de mise à jour nécessaire');
      }
    } else {
      console.warn('⚠️ Données livraisons API invalides ou vides');
      onError?.('Données livraisons invalides');
    }

    // Fin du chargement
    onLoadingStateChange?.(false);

  } catch (error) {
    console.error('❌ Erreur lors du chargement intelligent des livraisons:', error);
    onLoadingStateChange?.(false);
    onError?.(error.message);

    // En cas d'erreur, essayer quand même d'utiliser le cache si disponible
    const fallbackCache = await getDeliveriesFromCache(driverId);
    if (fallbackCache && fallbackCache.deliveries) {
      console.log('🔄 Erreur API, utilisation du cache comme fallback');
      onDataLoaded(fallbackCache.deliveries, true);
    } else {
      // Si pas de cache, retourner un tableau vide
      console.log('🔄 Pas de cache disponible, utilisation d\'un tableau vide');
      onDataLoaded([], false);
    }
  }
};

/**
 * Charge les stats du driver avec un cache intelligent
 * 1. Lit d'abord le cache AsyncStorage
 * 2. Affiche immédiatement si disponible
 * 3. Fetch l'API en arrière-plan
 * 4. Met à jour si les données ont changé
 *
 * @param {string} driverId - ID du driver
 * @param {Function} apiFetcher - Fonction pour fetch l'API (getDriverStats)
 * @param {Function} onDataLoaded - Callback quand les données sont prêtes (cache ou API)
 * @param {Function} onDataUpdated - Callback quand les données sont mises à jour depuis l'API
 * @param {Function} onLoadingStateChange - Callback pour l'état de chargement
 * @param {Function} onError - Callback en cas d'erreur
 */
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

    // 1. Essayer de charger depuis le cache
    onLoadingStateChange?.(true);
    const cachedData = await getDriverStatsFromCache(driverId);

    if (cachedData && cachedData.stats) {
      console.log('⚡ Stats affichées depuis le cache');
      onDataLoaded(cachedData.stats, true); // true = fromCache
      onLoadingStateChange?.(false);
    } else {
      console.log('📭 Pas de cache disponible, attente des données API');
      onLoadingStateChange?.(true);
    }

    // 2. Fetch l'API en arrière-plan (toujours, même si cache disponible)
    console.log('🌐 Fetch API en arrière-plan pour les stats...');
    const freshData = await apiFetcher();

    if (freshData) {
      console.log(`📡 Stats API reçues`);

      // 3. Vérifier si les données ont changé
      const hasChanged = !cachedData || hasDriverStatsChanged(cachedData.stats, freshData);

      if (hasChanged) {
        console.log('🔄 Stats mises à jour, sauvegarde en cache et affichage');

        // Sauvegarder en cache
        await saveDriverStatsToCache(freshData, driverId);

        // Mettre à jour l'affichage
        onDataUpdated(freshData);
      } else {
        console.log('✅ Stats identiques, pas de mise à jour nécessaire');
      }
    } else {
      console.warn('⚠️ Données stats API invalides ou vides');
      onError?.('Données stats invalides');
    }

    // Fin du chargement
    onLoadingStateChange?.(false);

  } catch (error) {
    console.error('❌ Erreur lors du chargement intelligent des stats:', error);
    onLoadingStateChange?.(false);
    onError?.(error.message);

    // En cas d'erreur, essayer quand même d'utiliser le cache si disponible
    const fallbackCache = await getDriverStatsFromCache(driverId);
    if (fallbackCache && fallbackCache.stats) {
      console.log('🔄 Erreur API, utilisation du cache comme fallback');
      onDataLoaded(fallbackCache.stats, true);
    } else {
      // Si pas de cache, retourner les stats par défaut
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

/**
 * Charge les restaurants proches avec un cache intelligent
 * 1. Lit d'abord le cache AsyncStorage
 * 2. Affiche immédiatement si disponible
 * 3. Fetch l'API en arrière-plan
 * 4. Met à jour si les données ont changé
 *
 * @param {number} latitude - Latitude du centre de recherche
 * @param {number} longitude - Longitude du centre de recherche
 * @param {number} radius - Rayon de recherche en km
 * @param {Function} apiFetcher - Fonction pour fetch l'API (getNearbyRestaurants)
 * @param {Function} onDataLoaded - Callback quand les données sont prêtes (cache ou API)
 * @param {Function} onDataUpdated - Callback quand les données sont mises à jour depuis l'API
 * @param {Function} onLoadingStateChange - Callback pour l'état de chargement
 * @param {Function} onError - Callback en cas d'erreur
 */
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
    console.log(`🚀 Démarrage du chargement intelligent des restaurants proches (${latitude.toFixed(4)}, ${longitude.toFixed(4)}, ${radius}km)`);

    // 1. Essayer de charger depuis le cache
    onLoadingStateChange?.(true);
    const cachedData = await getNearbyRestaurantsFromCache(latitude, longitude, radius);

    if (cachedData && cachedData.restaurants) {
      console.log('⚡ Restaurants proches affichés depuis le cache');
      onDataLoaded(cachedData.restaurants, true); // true = fromCache
      onLoadingStateChange?.(false);
    } else {
      console.log('📭 Pas de cache disponible, attente des données API');
      onLoadingStateChange?.(true);
    }

    // 2. Fetch l'API en arrière-plan (toujours, même si cache disponible)
    console.log('🌐 Fetch API en arrière-plan pour les restaurants proches...');
    const freshData = await apiFetcher(latitude, longitude, radius);

    if (freshData && Array.isArray(freshData)) {
      console.log(`📡 Restaurants proches API reçus: ${freshData.length} restaurants`);

      // 3. Vérifier si les données ont changé
      const hasChanged = !cachedData || hasNearbyRestaurantsChanged(cachedData.restaurants, freshData);

      if (hasChanged) {
        console.log('🔄 Restaurants proches mis à jour, sauvegarde en cache et affichage');

        // Sauvegarder en cache
        await saveNearbyRestaurantsToCache(freshData, latitude, longitude, radius);

        // Mettre à jour l'affichage
        onDataUpdated(freshData);
      } else {
        console.log('✅ Restaurants proches identiques, pas de mise à jour nécessaire');
      }
    } else {
      console.warn('⚠️ Données restaurants proches API invalides ou vides');
      onError?.('Données restaurants invalides');
    }

    // Fin du chargement
    onLoadingStateChange?.(false);

  } catch (error) {
    console.error('❌ Erreur lors du chargement intelligent des restaurants proches:', error);
    onLoadingStateChange?.(false);
    onError?.(error.message);

    // En cas d'erreur, essayer quand même d'utiliser le cache si disponible
    const fallbackCache = await getNearbyRestaurantsFromCache(latitude, longitude, radius);
    if (fallbackCache && fallbackCache.restaurants) {
      console.log('🔄 Erreur API, utilisation du cache comme fallback');
      onDataLoaded(fallbackCache.restaurants, true);
    } else {
      // Si pas de cache, retourner un tableau vide
      console.log('🔄 Pas de cache disponible, utilisation d\'un tableau vide');
      onDataLoaded([], false);
    }
  }
};

