import React, { createContext, useContext, useState, useEffect } from 'react'
import { getSettings } from '../api'
import { loadSettingsWithSmartCache, clearSettingsCache } from '../utils/cacheUtils'
import { useDriver } from './DriverContext'

// Créer le contexte
const SettingContext = createContext()

// Provider du contexte
export function SettingProvider({ children }) {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(false) // Démarrer à false pour éviter le chargement automatique
  const [error, setError] = useState(null)
  const { isAuthenticated } = useDriver()

  useEffect(() => {
    // Ne charger les settings que si l'utilisateur est authentifié
    if (isAuthenticated) {
      console.log('🔄 Chargement des settings car utilisateur authentifié')
      // Charger les settings avec le système de cache intelligent
      loadSettingsWithSmartCache(
        getSettings, // apiFetcher
        (data, fromCache) => {
          // onDataLoaded - appelé quand les données sont prêtes (cache ou API)
          setSettings(data)
          setError(null)
          if (fromCache) {
            console.log('🔄 Settings chargés depuis le cache')
          }
        },
        (data) => {
          // onDataUpdated - appelé quand les données sont mises à jour depuis l'API
          setSettings(data)
          console.log('🔄 Settings mis à jour depuis l\'API')
        },
        (loading) => {
          // onLoadingStateChange
          setLoading(loading)
        },
        (errorMsg) => {
          // onError
          setError(errorMsg)
          console.error('Erreur chargement settings:', errorMsg)
        }
      )
    } else {
      // Si l'utilisateur n'est pas authentifié, remettre à zéro les settings
      console.log('🔄 Utilisateur non authentifié - remise à zéro des settings')
      setSettings(null)
      setLoading(false)
      setError(null)
    }
  }, [isAuthenticated])

  const refreshSettings = async () => {
    // Ne rafraîchir que si l'utilisateur est authentifié
    if (!isAuthenticated) {
      console.log('🔄 Impossible de rafraîchir les settings - utilisateur non authentifié')
      return
    }

    // Forcer le rechargement depuis l'API (sans cache)
    try {
      setLoading(true)
      const settingsData = await getSettings()
      const appSettings = Array.isArray(settingsData) ? settingsData[0] : settingsData
      setSettings(appSettings)
      setError(null)

      // Sauvegarder dans le cache
      const { saveSettingsToCache } = await import('../utils/cacheUtils')
      saveSettingsToCache(appSettings)
    } catch (err) {
      console.error('Erreur rechargement settings:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const invalidateCache = async () => {
    // Invalider le cache et forcer un rechargement (seulement si authentifié)
    if (!isAuthenticated) {
      console.log('🔄 Impossible d\'invalider le cache des settings - utilisateur non authentifié')
      return
    }

    try {
      await clearSettingsCache()
      console.log('🗑️ Cache des settings invalidé')
      await refreshSettings()
    } catch (error) {
      console.error('Erreur lors de l\'invalidation du cache:', error)
    }
  }

  // Valeurs par défaut si pas encore chargé
  const defaultCurrency = settings?.currency || { symbol: '€', code: 'EUR' }
  const defaultLanguage = settings?.language || { code: 'fr', name: 'Français' }

  const value = {
    settings,
    loading,
    error,
    refreshSettings,
    invalidateCache,
    currency: defaultCurrency,
    language: defaultLanguage,
    appName: settings?.appName || 'Good Food Delivery'
  }

  return (
    <SettingContext.Provider value={value}>
      {children}
    </SettingContext.Provider>
  )
}

// Hook pour utiliser le contexte
export function useSettings() {
  const context = useContext(SettingContext)
  if (!context) {
    throw new Error('useSettings doit être utilisé dans un SettingProvider')
  }
  return context
}

// Fonctions utilitaires exportées

export const getSettingsCacheInfo = async () => {
  try {
    const { getSettingsFromCache } = await import('../utils/cacheUtils')
    const cacheData = await getSettingsFromCache()
    return cacheData ? {
      hasCache: true,
      timestamp: cacheData.timestamp,
      age: Date.now() - cacheData.timestamp,
      fromCache: true
    } : { hasCache: false }
  } catch (error) {
    return { hasCache: false, error: error.message }
  }
}

export default SettingContext
