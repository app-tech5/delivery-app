import { useState } from 'react';
import { Alert, Linking } from 'react-native';
import i18n from '../i18n';
import { DEFAULT_SETTINGS, EXTERNAL_LINKS } from '../utils/settingsData';

/**
 * Hook personnalisé pour gérer les paramètres de l'application
 * @param {Function} invalidateCache - Fonction pour invalider le cache
 * @param {Function} logout - Fonction de déconnexion
 * @returns {Object} État et fonctions pour gérer les paramètres
 */
export const useSettingsManager = (invalidateCache, logout) => {
  const [localSettings, setLocalSettings] = useState(DEFAULT_SETTINGS);

  // Gestionnaire de changement de switch
  const handleSwitchChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Gestionnaire de changement de thème
  const handleThemeChange = (theme) => {
    setLocalSettings(prev => ({
      ...prev,
      theme
    }));
  };

  // Gestionnaire de sauvegarde
  const handleSave = () => {
    // Simulation de sauvegarde
    Alert.alert('Success', i18n.t('settings.settingsSaved'));
  };

  // Gestionnaire de reset
  const handleReset = () => {
    Alert.alert(
      'Reset Settings',
      i18n.t('settings.confirmReset'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setLocalSettings(DEFAULT_SETTINGS);
            Alert.alert('Success', 'Settings reset to default');
          }
        }
      ]
    );
  };

  // Gestionnaire de clear cache
  const handleClearCache = async () => {
    try {
      await invalidateCache();
      Alert.alert('Success', i18n.t('settings.cacheCleared'));
    } catch (error) {
      Alert.alert('Error', 'Failed to clear cache');
    }
  };

  // Gestionnaire de clear data
  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      i18n.t('settings.confirmDataClear'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              Alert.alert('Success', i18n.t('settings.dataCleared'));
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          }
        }
      ]
    );
  };

  // Gestionnaire d'ouverture d'URL
  const openURL = (url) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open link');
    });
  };

  // Gestionnaire pour les actions génériques (langue, devise, etc.)
  const handleFeatureComingSoon = (feature) => {
    Alert.alert('Feature', `${feature} coming soon`);
  };

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
    externalLinks: EXTERNAL_LINKS
  };
};
