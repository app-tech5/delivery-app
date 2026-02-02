import { useState, useEffect } from 'react';
import { getSettings } from '../api';
import { loadSettingsWithSmartCache, clearSettingsCache, saveSettingsToCache } from '../utils/cacheUtils';
import {
  getCurrency,
  getLanguage,
  getAppName,
  resetSettingsState
} from '../utils/settingsUtils';

/**
 * Hook personnalisé pour gérer les paramètres de l'application
 * @param {boolean} isAuthenticated - État d'authentification du driver
 * @returns {Object} État et fonctions pour gérer les paramètres
 */
export const useSettingsManager = (isAuthenticated) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Ne charger les settings que si l'utilisateur est authentifié
    if (isAuthenticated) {
      console.log('🔄 Chargement des settings car utilisateur authentifié');
      // Charger les settings avec le système de cache intelligent
      loadSettingsWithSmartCache(
        getSettings, // apiFetcher
        (data, fromCache) => {
          // onDataLoaded - appelé quand les données sont prêtes (cache ou API)
          setSettings(data);
          setError(null);
          if (fromCache) {
            console.log('🔄 Settings chargés depuis le cache');
          }
        },
        (data) => {
          // onDataUpdated - appelé quand les données sont mises à jour depuis l'API
          setSettings(data);
          console.log('🔄 Settings mis à jour depuis l\'API');
        },
        (loading) => {
          // onLoadingStateChange
          setLoading(loading);
        },
        (errorMsg) => {
          // onError
          setError(errorMsg);
          console.error('Erreur chargement settings:', errorMsg);
        }
      );
    } else {
      // Si l'utilisateur n'est pas authentifié, remettre à zéro les settings
      console.log('🔄 Utilisateur non authentifié - remise à zéro des settings');
      const resetState = resetSettingsState();
      setSettings(resetState.settings);
      setLoading(resetState.loading);
      setError(resetState.error);
    }
  }, [isAuthenticated]);

  const refreshSettings = async () => {
    // Ne rafraîchir que si l'utilisateur est authentifié
    if (!isAuthenticated) {
      console.log('🔄 Impossible de rafraîchir les settings - utilisateur non authentifié');
      return;
    }

    // Forcer le rechargement depuis l'API (sans cache)
    try {
      setLoading(true);
      const settingsData = await getSettings();
      const appSettings = Array.isArray(settingsData) ? settingsData[0] : settingsData;
      setSettings(appSettings);
      setError(null);

      // Sauvegarder dans le cache
      saveSettingsToCache(appSettings);
    } catch (err) {
      console.error('Erreur rechargement settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const invalidateCache = async () => {
    // Invalider le cache et forcer un rechargement (seulement si authentifié)
    if (!isAuthenticated) {
      console.log('🔄 Impossible d\'invalider le cache des settings - utilisateur non authentifié');
      return;
    }

    try {
      await clearSettingsCache();
      console.log('🗑️ Cache des settings invalidé');
      await refreshSettings();
    } catch (error) {
      console.error('Erreur lors de l\'invalidation du cache:', error);
    }
  };

  // Valeurs calculées
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
    appName
  };
};