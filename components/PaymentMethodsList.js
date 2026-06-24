import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import i18n from '../i18n';
import { colors } from '../global';
import {
  normalizePaymentMethod,
  formatMaskedCard,
  formatMaskedBank,
  isStripeConnectMethod,
  getPaypalDisplayEmail,
} from '../utils/paymentMethodUtils';

const PaymentMethodsList = ({
  paymentMethods,
  loading,
  onEdit,
  onDelete,
  onSetDefault,
}) => {
  const getPaymentIcon = (methodType) => {
    switch (methodType) {
      case 'credit_card':
      case 'debit_card':
        return { set: 'material', name: 'payment' };
      case 'paypal':
        return { set: 'fontawesome', name: 'paypal' };
      case 'apple_pay':
        return { set: 'material', name: 'phone-iphone' };
      case 'google_pay':
        return { set: 'material', name: 'account-balance-wallet' };
      case 'cash_on_delivery':
        return { set: 'material', name: 'attach-money' };
      case 'bank_transfer':
        return { set: 'material', name: 'account-balance' };
      default:
        return { set: 'material', name: 'payment' };
    }
  };

  const renderPaymentIcon = (methodType, isDefault) => {
    const icon = getPaymentIcon(methodType);
    const iconColor = isDefault ? colors.primary : colors.text.primary;
    if (icon.set === 'fontawesome') {
      return <FontAwesome name={icon.name} size={24} color={iconColor} />;
    }
    return <MaterialIcons name={icon.name} size={24} color={iconColor} />;
  };

  const getPaymentTypeName = (methodType) => {
    switch (methodType) {
      case 'credit_card':
        return i18n.t('payment.creditCard');
      case 'debit_card':
        return i18n.t('payment.debitCard');
      case 'paypal':
        return i18n.t('payment.paypal');
      case 'apple_pay':
        return i18n.t('payment.applePay');
      case 'google_pay':
        return i18n.t('payment.googlePay');
      case 'cash_on_delivery':
        return i18n.t('payment.cashOnDelivery');
      case 'bank_transfer':
        return i18n.t('payment.bankTransfer');
      default:
        return i18n.t('payment.other');
    }
  };

  const getStatusColor = (verificationStatus) => {
    switch (verificationStatus) {
      case 'verified':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'failed':
        return colors.error;
      default:
        return colors.text.secondary;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer} testID="payment-methods-loading">
        <Text style={styles.loadingText}>{i18n.t('common.loading')}</Text>
      </View>
    );
  }

  if (!paymentMethods || paymentMethods.length === 0) {
    return (
      <View style={styles.emptyContainer} testID="payment-methods-empty">
        <MaterialIcons name="payment" size={48} color={colors.text.secondary} />
        <Text style={styles.emptyTitle}>{i18n.t('payment.noOtherPayoutMethods')}</Text>
        <Text style={styles.emptySubtitle}>{i18n.t('payment.addPaypalPayoutMethod')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="payment-methods-list">
      {paymentMethods.map((rawMethod) => {
        const method = normalizePaymentMethod(rawMethod);
        const stripeManaged = isStripeConnectMethod(method);
        return (
          <View
            key={method._id}
            style={[styles.paymentMethodItem, method.isDefault && styles.defaultItem]}
            testID={`payment-method-item-${method._id}`}
          >
            <View style={styles.paymentIconContainer}>
              {renderPaymentIcon(method.methodType, method.isDefault)}
            </View>

            <View style={styles.paymentDetails}>
              <View style={styles.paymentHeader}>
                <Text style={[styles.paymentType, method.isDefault && styles.defaultText]}>
                  {getPaymentTypeName(method.methodType)}
                </Text>
                {method.isDefault ? (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>{i18n.t('payment.default')}</Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.paymentMasked} testID={`payment-method-masked-${method._id}`}>
                {method.methodType === 'paypal'
                  ? getPaypalDisplayEmail(method)
                  : method.methodType === 'bank_transfer'
                    ? formatMaskedBank(method)
                    : formatMaskedCard(method)}
              </Text>

              <View style={styles.paymentFooter}>
                <View style={styles.statusContainer}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(method.verificationStatus) },
                    ]}
                  />
                  <Text style={styles.statusText}>
                    {method.verificationStatus === 'verified'
                      ? i18n.t('payment.verified')
                      : method.verificationStatus === 'pending'
                        ? i18n.t('payment.pending')
                        : method.verificationStatus === 'failed'
                          ? i18n.t('payment.failed')
                          : i18n.t('payment.unverified')}
                  </Text>
                </View>

                {method.cardDetails?.expiryMonth && method.cardDetails?.expiryYear ? (
                  <Text style={styles.expiryText}>
                    {i18n.t('payment.expires')}{' '}
                    {method.cardDetails.expiryMonth}/{method.cardDetails.expiryYear}
                  </Text>
                ) : null}
              </View>

              <View style={styles.actionsRow}>
                {!method.isDefault ? (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => onSetDefault?.(method)}
                    testID={`payment-method-default-${method._id}`}
                  >
                    <MaterialIcons name="star-outline" size={18} color={colors.primary} />
                    <Text style={styles.actionText}>{i18n.t('payment.setAsDefault')}</Text>
                  </TouchableOpacity>
                ) : null}

                {!stripeManaged ? (
                  <>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => onEdit?.(method)}
                      testID={`payment-method-edit-${method._id}`}
                    >
                      <MaterialIcons name="edit" size={18} color={colors.primary} />
                      <Text style={styles.actionText}>{i18n.t('common.edit')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => onDelete?.(method)}
                      testID={`payment-method-delete-${method._id}`}
                    >
                      <MaterialIcons name="delete-outline" size={18} color={colors.error} />
                      <Text style={[styles.actionText, styles.deleteText]}>{i18n.t('common.delete')}</Text>
                    </TouchableOpacity>
                  </>
                ) : null}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  defaultItem: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  paymentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  defaultText: {
    color: colors.primary,
  },
  defaultBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.white,
    textTransform: 'uppercase',
  },
  paymentMasked: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  expiryText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border.light,
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingRight: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  deleteText: {
    color: colors.error,
  },
});

export default PaymentMethodsList;
