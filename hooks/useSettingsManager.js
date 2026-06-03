import { useState, useEffect } from 'react';
import { getSettings } from '../api';
import { loadSettingsWithSmartCache, clearSettingsCache, saveSettingsToCache } from '../utils/cacheUtils';
import {
  getCurrency,
  getLanguage,
  getAppName,
  resetSettingsState,
} from '../utils/settingsUtils';

/**
 * @param {boolean} canLoadSettings - Auth resolved, onboarding complete (same as restaurant-app gate)
 */
export const useSettingsManager = (canLoadSettings) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (canLoadSettings) {
      loadSettingsWithSmartCache(
        getSettings,
        (data, fromCache) => {
          setSettings(data);
          setError(null);
        },
        (data) => {
          setSettings(data);
        },
        (loadingState) => {
          setLoading(loadingState);
        },
        (errorMsg) => {
          setError(errorMsg);
          console.error('Error loading settings:', errorMsg);
        }
      );
    } else {
      const resetState = resetSettingsState();
      setSettings(resetState.settings);
      setLoading(resetState.loading);
      setError(resetState.error);
    }
  }, [canLoadSettings]);

  const refreshSettings = async () => {
    if (!canLoadSettings) return;

    try {
      setLoading(true);
      const settingsData = await getSettings();
      const appSettings = Array.isArray(settingsData) ? settingsData[0] : settingsData;
      setSettings(appSettings);
      setError(null);
      saveSettingsToCache(appSettings);
    } catch (err) {
      console.error('Error refreshing settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const invalidateCache = async () => {
    if (!canLoadSettings) return;

    try {
      await clearSettingsCache();
      await refreshSettings();
    } catch (err) {
      console.error('Error invalidating settings cache:', err);
    }
  };

  const currency = getCurrency(settings);
  const language = getLanguage(settings);
  const appName = getAppName(settings);

  return {
    settings,
    loading,
    error,
    refreshSettings,
    invalidateCache,
    currency,
    language,
    appName,
  };
};
