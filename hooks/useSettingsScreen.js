import { useState, useCallback } from 'react';
import { Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';
import { DEFAULT_SETTINGS } from '../utils/settingsData';
import { clearSettingsCache } from '../utils/cacheUtils';

const LOCAL_SETTINGS_KEY = 'driver_local_settings';

export function useSettingsScreen(invalidateCache, logout) {
  const [localSettings, setLocalSettings] = useState(DEFAULT_SETTINGS);

  const persistSettings = useCallback(async (next) => {
    try {
      await AsyncStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(next));
    } catch (error) {
      console.error('Error saving local settings:', error);
    }
  }, []);

  const handleSwitchChange = useCallback((key, value) => {
    setLocalSettings((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'locationServices' && !value) {
        next.backgroundLocation = false;
      }
      persistSettings(next);
      return next;
    });
  }, [persistSettings]);

  const handleThemeChange = useCallback((theme) => {
    setLocalSettings((prev) => {
      const next = { ...prev, theme };
      persistSettings(next);
      return next;
    });
  }, [persistSettings]);

  const handleSave = useCallback(() => {
    Alert.alert(i18n.t('settings.save'), i18n.t('settings.settingsSaved'));
  }, []);

  const handleReset = useCallback(() => {
    setLocalSettings(DEFAULT_SETTINGS);
    persistSettings(DEFAULT_SETTINGS);
    Alert.alert(i18n.t('settings.reset'), i18n.t('settings.settingsSaved'));
  }, [persistSettings]);

  const handleClearCache = useCallback(async () => {
    try {
      await clearSettingsCache();
      if (typeof invalidateCache === 'function') {
        await invalidateCache();
      }
      Alert.alert(i18n.t('settings.clearCache'), i18n.t('settings.cacheCleared'));
    } catch (error) {
      console.error('Clear cache error:', error);
      Alert.alert(i18n.t('errors.error'), i18n.t('errors.serverError'));
    }
  }, [invalidateCache]);

  const handleClearData = useCallback(() => {
    Alert.alert(
      i18n.t('settings.clearData'),
      i18n.t('settings.clearDataSubtitle'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(LOCAL_SETTINGS_KEY);
              setLocalSettings(DEFAULT_SETTINGS);
              if (typeof logout === 'function') {
                await logout();
              }
            } catch (error) {
              console.error('Clear data error:', error);
            }
          },
        },
      ]
    );
  }, [logout]);

  const openURL = useCallback(async (url) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Open URL error:', error);
    }
  }, []);

  const handleFeatureComingSoon = useCallback((feature) => {
    Alert.alert(feature, i18n.t('auth.comingSoon'));
  }, []);

  return {
    localSettings,
    handleSwitchChange,
    handleThemeChange,
    handleSave,
    handleReset,
    handleClearCache,
    handleClearData,
    openURL,
    handleFeatureComingSoon,
  };
}
