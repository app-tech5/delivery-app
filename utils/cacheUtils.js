import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache keys pour delivery-app
const CACHE_KEYS = {
  SETTINGS: 'app_settings',
  DRIVER_DELIVERIES: 'driver_deliveries',
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

