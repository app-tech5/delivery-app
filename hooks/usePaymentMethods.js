import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api';
import { loadPaymentMethodsWithCache, clearPaymentMethodsCache } from '../utils/cacheUtils';
import { normalizePaymentMethods } from '../utils/paymentMethodUtils';

export const usePaymentMethods = (driver, hasCompletedOnboarding, enabled = true) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [initialLoading, setInitialLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const canLoad = Boolean(enabled && hasCompletedOnboarding && driver?._id);

  const applyMethods = useCallback((data) => {
    setPaymentMethods(normalizePaymentMethods(data));
  }, []);

  const loadPaymentMethods = useCallback(async ({ showRefresh = false } = {}) => {
    if (!canLoad) return;

    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setInitialLoading(true);
      }

      await loadPaymentMethodsWithCache(
        driver._id,
        () => apiClient.getPaymentMethods(),
        (data) => {
          applyMethods(data);
        },
        (data) => {
          applyMethods(data);
        },
        () => {},
        (errorMsg) => {
          console.error('Erreur chargement méthodes de paiement:', errorMsg);
        }
      );
    } catch (error) {
      console.error('Error loading payment methods with smart cache:', error);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, [canLoad, driver?._id, applyMethods]);

  const invalidatePaymentMethodsCache = useCallback(async () => {
    if (!canLoad) return;

    try {
      await clearPaymentMethodsCache(driver._id);
      await loadPaymentMethods({ showRefresh: true });
    } catch (error) {
      console.error('Erreur invalidation cache payment methods:', error);
      setRefreshing(false);
    }
  }, [canLoad, driver?._id, loadPaymentMethods]);

  useEffect(() => {
    if (canLoad) {
      loadPaymentMethods();
      return;
    }

    if (!enabled) {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, [canLoad, enabled, loadPaymentMethods]);

  return {
    paymentMethods,
    loading: initialLoading,
    refreshing,
    loadPaymentMethods,
    invalidatePaymentMethodsCache,
  };
};
