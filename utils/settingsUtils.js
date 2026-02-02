import { DEFAULT_CURRENCY, getCurrency } from './currencyUtils';

/**
 * Valeurs par défaut pour les paramètres
 */
export const DEFAULT_LANGUAGE = { code: 'fr', name: 'Français' };
export const DEFAULT_APP_NAME = 'Good Food Delivery';

/**
 * Obtient les informations de cache des paramètres
 * @returns {Promise<Object>} Informations sur le cache
 */
export const getSettingsCacheInfo = async () => {
  try {
    const { getSettingsFromCache } = await import('../utils/cacheUtils');
    const cacheData = await getSettingsFromCache();
    return cacheData ? {
      hasCache: true,
      timestamp: cacheData.timestamp,
      age: Date.now() - cacheData.timestamp,
      fromCache: true
    } : { hasCache: false };
  } catch (error) {
    return { hasCache: false, error: error.message };
  }
};

// Réexport de getCurrency depuis currencyUtils
export { getCurrency, DEFAULT_CURRENCY };

/**
 * Obtient la langue par défaut ou celle des paramètres
 * @param {Object} settings - Objet des paramètres
 * @returns {Object} Langue
 */
export const getLanguage = (settings) => {
  return settings?.language || DEFAULT_LANGUAGE;
};

/**
 * Obtient le nom de l'application par défaut ou celui des paramètres
 * @param {Object} settings - Objet des paramètres
 * @returns {string} Nom de l'application
 */
export const getAppName = (settings) => {
  return settings?.appName || DEFAULT_APP_NAME;
};

/**
 * Remet à zéro l'état des paramètres
 * @returns {Object} État remis à zéro
 */
export const resetSettingsState = () => ({
  settings: null,
  loading: false,
  error: null
});
