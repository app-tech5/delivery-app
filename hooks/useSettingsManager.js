import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api';
import { loadSettingsWithSmartCache, clearSettingsCache, saveSettingsToCache } from '../utils/cacheUtils';
import {
  getCurrency,
  getLanguage,
  getAppName,
  resetSettingsState,
} from '../utils/settingsUtils';
import { SUPPORTED_CURRENCIES } from '../utils/currencyUtils';
import { LANGUAGE_OPTIONS } from '../utils/settingsData';
import {
  changeLanguage as applyLanguage,
  getCurrentLanguage,
  isLanguageSupported,
} from '../i18n';

const LOCALE_STORAGE_KEY = 'driver_app_locale';
const CURRENCY_OVERRIDE_KEY = 'driver_preferred_currency';

const mapFallbackCurrencies = () =>
  SUPPORTED_CURRENCIES.map((item) => ({
    _id: item.key,
    code: item.key,
    symbol: item.symbol,
    name: item.label,
  }));

export const useSettingsManager = (canLoadSettings) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currencyOverride, setCurrencyOverride] = useState(null);
  const [localeVersion, setLocaleVersion] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadPreferences = async () => {
      try {
        const [savedLocale, savedCurrency] = await Promise.all([
          AsyncStorage.getItem(LOCALE_STORAGE_KEY),
          AsyncStorage.getItem(CURRENCY_OVERRIDE_KEY),
        ]);

        if (mounted && savedLocale && isLanguageSupported(savedLocale)) {
          applyLanguage(savedLocale);
        }

        if (mounted && savedCurrency) {
          setCurrencyOverride(JSON.parse(savedCurrency));
        }
      } catch (prefError) {
        console.error('Error loading preferences:', prefError);
      }
    };

    loadPreferences();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (canLoadSettings) {
      loadSettingsWithSmartCache(
        () => apiClient.getSettings(),
        (data, fromCache) => {
          const appSettings = Array.isArray(data) ? data[0] : data;
          setSettings(appSettings);
          setError(null);
        },
        (data) => {
          const appSettings = Array.isArray(data) ? data[0] : data;
          setSettings(appSettings);
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
      const settingsData = await apiClient.getSettings();
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

  const getAvailableLanguages = useCallback(
    () => LANGUAGE_OPTIONS.filter((lang) => isLanguageSupported(lang.key)),
    []
  );

  const changeLanguage = useCallback(async (languageCode) => {
    if (!isLanguageSupported(languageCode)) {
      throw new Error('unsupported_language');
    }
    applyLanguage(languageCode);
    await AsyncStorage.setItem(LOCALE_STORAGE_KEY, languageCode);
    setLocaleVersion((version) => version + 1);
    return { success: true };
  }, []);

  const getAvailableCurrencies = useCallback(async () => {
    try {
      const list = await apiClient.listCurrencies();
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    } catch (currencyError) {
      console.error('Error fetching currencies:', currencyError);
    }
    return mapFallbackCurrencies();
  }, []);

  const changeCurrency = useCallback(async (currencyItem) => {
    const currencyId = currencyItem?._id || currencyItem?.id;
    const settingsId = settings?._id;

    if (settingsId && currencyId && String(currencyId).length > 10) {
      try {
        await apiClient.updateSettingsDocument(settingsId, { currency: currencyId });
        await refreshSettings();
        await AsyncStorage.removeItem(CURRENCY_OVERRIDE_KEY);
        setCurrencyOverride(null);
        return { success: true };
      } catch (updateError) {
        console.warn('Currency API update failed, using local override:', updateError);
      }
    }

    const override = {
      _id: currencyId || currencyItem?.code,
      symbol: currencyItem?.symbol,
      code: currencyItem?.code,
      name: currencyItem?.name || currencyItem?.label,
    };
    setCurrencyOverride(override);
    await AsyncStorage.setItem(CURRENCY_OVERRIDE_KEY, JSON.stringify(override));
    return { success: true, local: true };
  }, [settings?._id, refreshSettings]);

  const currency = currencyOverride || getCurrency(settings);
  const language = getLanguage(settings);
  const appName = getAppName(settings);

  return {
    settings,
    loading,
    error,
    refreshSettings,
    invalidateCache,
    getAvailableLanguages,
    getAvailableCurrencies,
    changeLanguage,
    changeCurrency,
    currency,
    language,
    appName,
    currentLanguage: getCurrentLanguage(),
    localeVersion,
  };
};
