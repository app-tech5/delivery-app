import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import i18n from '../i18n';
import { colors } from '../global';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useDriver } from '../contexts/DriverContext';
import { usePaymentMethods } from '../hooks';
import { formatPayoutMethodLabel } from '../utils/paymentMethodUtils';

const PaymentSettings = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { driver, hasCompletedOnboarding } = useDriver();
  const { paymentMethods, loading } = usePaymentMethods(
    driver,
    hasCompletedOnboarding,
    isFocused
  );

  const handlePaymentMethodsPress = () => {
    
    navigation.navigate('PaymentMethods');
  };

  const getDefaultPaymentMethod = () => {
    return paymentMethods.find(method => method.isDefault);
  };

  const formatPaymentMethodName = (method) => {
    if (!method) return i18n.t('payment.noDefaultMethod');
    return formatPayoutMethodLabel(method) || i18n.t('payment.otherMethod');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{i18n.t('settings.payout')}</Text>

      <TouchableOpacity
        style={styles.settingItem}
        onPress={handlePaymentMethodsPress}
      >
        <View style={styles.settingLeft}>
          <View style={styles.iconContainer}>
            <MaterialIcons
              name="account-balance-wallet"
              size={20}
              color={colors.primary}
            />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>
              {i18n.t('payment.payoutMethodsTitle')}
            </Text>
            <Text style={styles.settingSubtitle}>
              {loading
                ? i18n.t('common.loading')
                : i18n.t('payment.payoutMethodsSubtitle')}
            </Text>
          </View>
        </View>

        <View style={styles.settingRight}>
          <MaterialIcons
            name="chevron-right"
            size={20}
            color={colors.text.secondary}
          />
        </View>
      </TouchableOpacity>

      {getDefaultPaymentMethod() && (
        <View style={styles.defaultMethodContainer}>
          <Text style={styles.defaultMethodLabel}>
            {i18n.t('payment.defaultMethod')}:
          </Text>
          <Text style={styles.defaultMethodValue}>
            {formatPaymentMethodName(getDefaultPaymentMethod())}
          </Text>
        </View>
      )}

      {!loading && paymentMethods.length === 0 && (
        <TouchableOpacity
          style={styles.addMethodButton}
          onPress={handlePaymentMethodsPress}
        >
          <MaterialIcons
            name="add"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.addMethodText}>
            {i18n.t('payment.addPaymentMethod')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  settingRight: {
    marginLeft: 8,
  },
  defaultMethodContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.background.secondary,
  },
  defaultMethodLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  defaultMethodValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  addMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
  },
  addMethodText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: 8,
  },
});

export default PaymentSettings;

