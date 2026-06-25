import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import i18n from '../i18n';
import { colors } from '../global';
import apiClient from '../api';
import { config } from '../config';

const StripeConnectPayoutCard = ({ onPayoutMethodsUpdated }) => {
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [status, setStatus] = useState(null);

  const loadStatus = useCallback(async () => {
    try {
      const nextStatus = await apiClient.getStripeConnectStatus();
      setStatus(nextStatus);
      return nextStatus;
    } catch (error) {
      console.error('Stripe Connect status error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    const handleDeepLink = async ({ url }) => {
      if (!url?.includes('stripe-connect')) return;
      setLoading(true);
      try {
        await apiClient.syncStripeConnectPayoutMethod();
        await loadStatus();
        onPayoutMethodsUpdated?.();
      } catch (error) {
        Alert.alert(i18n.t('common.error'), error.message || i18n.t('payment.stripeConnectSyncError'));
      } finally {
        setLoading(false);
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, [loadStatus, onPayoutMethodsUpdated]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const result = await apiClient.startStripeConnectOnboarding();

      if (result.demoCompleted) {
        await loadStatus();
        if (config.DEMO_MODE === true) {
          await apiClient.syncStripeConnectPayoutMethod();
        }
        await onPayoutMethodsUpdated?.();
        if (config.DEMO_MODE === true) {
          Alert.alert(
            i18n.t('common.success'),
            result.alreadyConnected
              ? i18n.t('payment.stripeConnectDemoUpdateNote')
              : i18n.t('payment.stripeConnectDemoReady')
          );
        }
        return;
      }

      if (!result.url) {
        throw new Error(i18n.t('payment.stripeConnectMissingUrl'));
      }

      await Linking.openURL(result.url);
    } catch (error) {
      Alert.alert(i18n.t('common.error'), error.message || i18n.t('payment.stripeConnectStartError'));
    } finally {
      setConnecting(false);
    }
  };

  const isReady = Boolean(status?.payoutsEnabled && status?.detailsSubmitted);

  return (
    <View style={styles.card} testID="stripe-connect-card">
      <View style={styles.header}>
        <MaterialIcons name="account-balance" size={24} color={colors.primary} />
        <View style={styles.headerText}>
          <Text style={styles.title}>{i18n.t('payment.stripeConnectTitle')}</Text>
          <Text style={styles.subtitle}>{i18n.t('payment.stripeConnectSubtitle')}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : (
        <>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: isReady ? colors.success : colors.warning }]} />
            <Text style={styles.statusText}>
              {isReady
                ? i18n.t('payment.stripeConnectReady')
                : i18n.t('payment.stripeConnectPending')}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, connecting && styles.buttonDisabled]}
            onPress={handleConnect}
            disabled={connecting}
            testID="stripe-connect-button"
          >
            {connecting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>
                {isReady ? i18n.t('payment.stripeConnectUpdate') : i18n.t('payment.stripeConnectSetup')}
              </Text>
            )}
          </TouchableOpacity>
          {isReady ? (
            <Text style={styles.hintText}>{i18n.t('payment.stripeConnectUpdateHint')}</Text>
          ) : null}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border?.light || '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  loader: {
    marginTop: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  button: {
    marginTop: 16,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  hintText: {
    marginTop: 10,
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 17,
  },
});

export default StripeConnectPayoutCard;
