import { useState, useEffect } from 'react';
import apiClient from '../api';
import { loadPaymentMethodsWithCache, clearPaymentMethodsCache } from '../utils/cacheUtils';

/**
 * Hook personnalisé pour gérer les méthodes de paiement
 * @param {Object} driver - Objet driver
 * @param {boolean} isAuthenticated - État d'authentification
 * @returns {Object} État et fonctions des méthodes de paiement
 */
export const usePaymentMethods = (driver, isAuthenticated) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);

  // Charger les méthodes de paiement avec cache intelligent
  const loadPaymentMethods = async () => {
    if (!isAuthenticated || !driver?._id) {
      console.log('❌ Driver non authentifié, impossible de charger les méthodes de paiement');
      return;
    }

    try {
      setLoading(true);
      // Utiliser le cache intelligent pour les méthodes de paiement
      await loadPaymentMethodsWithCache(
        driver._id, // driverId (ou userId du driver)
        () => apiClient.getPaymentMethods(), // apiFetcher
        (data, fromCache) => {
          // onDataLoaded - appelé quand les données sont prêtes (cache ou API)
          setPaymentMethods(data);
          if (fromCache) {
            console.log('🔄 Méthodes de paiement chargées depuis le cache');
          }
        },
        (data) => {
          // onDataUpdated - appelé quand les données sont mises à jour depuis l'API
          setPaymentMethods(data);
          console.log('🔄 Méthodes de paiement mises à jour depuis l\'API');
        },
        (loading) => {
          // onLoadingStateChange - on pourrait utiliser un état de chargement spécifique
          console.log(`🔄 État de chargement des méthodes de paiement: ${loading}`);
        },
        (errorMsg) => {
          // onError
          console.error('Erreur chargement méthodes de paiement:', errorMsg);
        }
      );
    } catch (error) {
      console.error('Error loading payment methods with smart cache:', error);
    } finally {
      setLoading(false);
    }
  };

  // Invalider le cache des méthodes de paiement (pour forcer un rechargement)
  const invalidatePaymentMethodsCache = async () => {
    if (driver?._id) {
      try {
        await clearPaymentMethodsCache(driver._id);
        console.log('🗑️ Cache des méthodes de paiement invalidé');
        await loadPaymentMethods(); // Recharger immédiatement
      } catch (error) {
        console.error('Erreur lors de l\'invalidation du cache des méthodes de paiement:', error);
      }
    }
  };

  // Charger automatiquement les méthodes de paiement quand le driver change
  useEffect(() => {
    if (isAuthenticated && driver?._id) {
      loadPaymentMethods();
    }
  }, [driver?._id, isAuthenticated]);

  return {
    paymentMethods,
    loading,
    loadPaymentMethods,
    invalidatePaymentMethodsCache
  };
};


