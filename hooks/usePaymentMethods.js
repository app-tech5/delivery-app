import { useState, useEffect } from 'react';
import apiClient from '../api';
import { loadPaymentMethodsWithCache, clearPaymentMethodsCache } from '../utils/cacheUtils';

export const usePaymentMethods = (driver, hasCompletedOnboarding) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const loadPaymentMethods = async () => {
    if (!hasCompletedOnboarding || !driver?._id) {
      console.log('❌ Driver non authentifié, impossible de charger les méthodes de paiement');
      return;
    }

    try {
      setLoading(true);
      
      await loadPaymentMethodsWithCache(
        driver._id, 
        () => apiClient.getPaymentMethods(), 
        (data, fromCache) => {
          
          setPaymentMethods(data);
          if (fromCache) {
            console.log('🔄 Méthodes de paiement chargées depuis le cache');
          }
        },
        (data) => {
          
          setPaymentMethods(data);
          console.log('🔄 Méthodes de paiement mises à jour depuis l\'API');
        },
        (loading) => {
          
          console.log(`🔄 État de chargement des méthodes de paiement: ${loading}`);
        },
        (errorMsg) => {
          
          console.error('Erreur chargement méthodes de paiement:', errorMsg);
        }
      );
    } catch (error) {
      console.error('Error loading payment methods with smart cache:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const invalidatePaymentMethodsCache = async () => {
    if (driver?._id) {
      try {
        await clearPaymentMethodsCache(driver._id);
        console.log('🗑️ Cache des méthodes de paiement invalidé');
        await loadPaymentMethods(); 
      } catch (error) {
        console.error('Erreur lors de l\'invalidation du cache des méthodes de paiement:', error);
      }
    }
  };
  
  useEffect(() => {
    if (hasCompletedOnboarding && driver?._id) {
      loadPaymentMethods();
    }
  }, [driver?._id, hasCompletedOnboarding]);

  return {
    paymentMethods,
    loading,
    loadPaymentMethods,
    invalidatePaymentMethodsCache
  };
};

