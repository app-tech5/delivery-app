import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import i18n from '../i18n';
import { config } from '../config';
import apiClient from '../api';
import { buildContactActions, mapSupportFaqs, getPlatformLabel } from '../utils/supportUtils';

export const useSupport = (currency, driver) => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [appConfig, setAppConfig] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);
  const [error, setError] = useState(null);

  const loadSupportInfo = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [configData, faqData] = await Promise.all([
        apiClient.getAppConfig().catch(() => null),
        apiClient.getSupportFaqs().catch(() => []),
      ]);

      setAppConfig(configData);
      setFaqs(mapSupportFaqs(faqData));

      if (!configData && faqData.length === 0) {
        setError(i18n.t('support.loadError'));
      }
    } catch (err) {
      console.error('Error loading support info:', err);
      setError(i18n.t('support.loadError'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSupportInfo();
  }, [loadSupportInfo]);

  const contactActions = useMemo(
    () => buildContactActions(appConfig),
    [appConfig]
  );

  const toggleFAQ = (faqId) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const submitBugReport = useCallback(async (bugReport) => {
    if (!bugReport.description.trim()) {
      Alert.alert(i18n.t('common.error'), i18n.t('support.describeIssueRequired'));
      return;
    }

    if (!apiClient.user?.id && !apiClient.user?._id) {
      Alert.alert(i18n.t('common.error'), i18n.t('support.authRequired'));
      return;
    }

    setSubmitting(true);

    try {
      await apiClient.submitSupportTicket(bugReport);
      Alert.alert(i18n.t('common.success'), i18n.t('support.reportSent'), [
        {
          text: i18n.t('common.ok'),
          onPress: () => setFormResetKey((key) => key + 1),
        },
      ]);
    } catch (err) {
      console.error('Error submitting support ticket:', err);
      Alert.alert(i18n.t('common.error'), i18n.t('support.reportError'));
    } finally {
      setSubmitting(false);
    }
  }, []);

  const handleContactAction = async (action) => {
    if (action.actionType === 'email' && action.value) {
      const url = `mailto:${action.value}?subject=${encodeURIComponent(i18n.t('support.emailSubject'))}`;
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (!canOpen) {
          throw new Error('Cannot open mail client');
        }
        await Linking.openURL(url);
      } catch (err) {
        console.error('Error opening email:', err);
        Alert.alert(i18n.t('common.error'), i18n.t('support.emailError'));
      }
    }
  };

  const systemInfo = useMemo(
    () => ({
      appVersion: config.VERSION,
      platform: getPlatformLabel(Platform.OS),
      osVersion: Platform.Version,
      device: i18n.t('support.unknownDevice'),
      currency: currency?.code || 'EUR',
    }),
    [currency?.code]
  );

  return {
    expandedFAQ,
    systemInfo,
    contactActions,
    faqs,
    loading,
    submitting,
    formResetKey,
    error,
    supportEmail: appConfig?.supportEmail || null,
    toggleFAQ,
    submitBugReport,
    handleContactAction,
    reloadSupportInfo: loadSupportInfo,
    driver,
  };
};
