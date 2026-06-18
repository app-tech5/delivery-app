import { DEFAULT_CURRENCY, getCurrency } from './currencyUtils';

export const DEFAULT_LANGUAGE = { code: 'fr', name: 'Français' };
export const DEFAULT_APP_NAME = 'Good Food Delivery';

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

export { getCurrency, DEFAULT_CURRENCY };

export const getLanguage = (settings) => {
  return settings?.language || DEFAULT_LANGUAGE;
};

export const getAppName = (settings) => {
  return settings?.appName || DEFAULT_APP_NAME;
};

export const resetSettingsState = () => ({
  settings: null,
  loading: false,
  error: null
});
