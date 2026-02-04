import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import i18n from '../i18n';
import { colors } from '../global';

const PaymentMethodsList = ({ paymentMethods, loading, onRefresh }) => {
  // Fonction pour obtenir l'icône selon le type de paiement
  const getPaymentIcon = (methodType) => {
    switch (methodType) {
      case 'credit_card':
      case 'debit_card':
        return 'credit-card';
      case 'paypal':
        return 'paypal';
      case 'apple_pay':
        return 'apple';
      case 'google_pay':
        return 'google';
      case 'cash_on_delivery':
        return 'money';
      case 'bank_transfer':
        return 'bank';
      default:
        return 'payment';
    }
  };

  // Fonction pour obtenir le nom du type de paiement
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

  // Fonction pour formater les détails masqués
  const formatMaskedDetails = (method) => {
    switch (method.methodType) {
      case 'credit_card':
      case 'debit_card':
        return `•••• •••• •••• ${method.cardDetails?.cardNumberLast4 || '****'}`;
      case 'paypal':
        return method.paypalEmail?.replace(/(.{1,3})(.*)(@.*)/, (m, a, b, c) => a + b.replace(/./g, '*') + c) || '';
      case 'apple_pay':
      case 'google_pay':
        return '••••••••••••••••';
      default:
        return '';
    }
  };

  // Fonction pour obtenir la couleur selon le statut de vérification
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
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{i18n.t('common.loading')}</Text>
      </View>
    );
  }

  if (!paymentMethods || paymentMethods.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="payment" size={48} color={colors.text.secondary} />
        <Text style={styles.emptyTitle}>{i18n.t('payment.noPaymentMethods')}</Text>
        <Text style={styles.emptySubtitle}>{i18n.t('payment.addFirstPaymentMethod')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method._id}
          style={[
            styles.paymentMethodItem,
            method.isDefault && styles.defaultItem
          ]}
          onPress={() => {
            // Action à définir - peut-être ouvrir les détails ou changer la méthode par défaut
            Alert.alert(
              getPaymentTypeName(method.methodType),
              formatMaskedDetails(method),
              [
                { text: i18n.t('common.cancel'), style: 'cancel' },
                method.isDefault ? null : {
                  text: i18n.t('payment.setAsDefault'),
                  onPress: () => {
                    // Logique pour définir comme méthode par défaut
                    console.log('Set as default:', method._id);
                  }
                }
              ].filter(Boolean)
            );
          }}
        >
          <View style={styles.paymentIconContainer}>
            {method.methodType === 'paypal' ? (
              <FontAwesome
                name={getPaymentIcon(method.methodType)}
                size={24}
                color={method.isDefault ? colors.primary : colors.text.primary}
              />
            ) : (
              <MaterialIcons
                name={getPaymentIcon(method.methodType)}
                size={24}
                color={method.isDefault ? colors.primary : colors.text.primary}
              />
            )}
          </View>

          <View style={styles.paymentDetails}>
            <View style={styles.paymentHeader}>
              <Text style={[
                styles.paymentType,
                method.isDefault && styles.defaultText
              ]}>
                {getPaymentTypeName(method.methodType)}
              </Text>
              {method.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>{i18n.t('payment.default')}</Text>
                </View>
              )}
            </View>

            <Text style={styles.paymentMasked}>
              {formatMaskedDetails(method)}
            </Text>

            <View style={styles.paymentFooter}>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(method.verificationStatus) }
                ]} />
                <Text style={styles.statusText}>
                  {method.verificationStatus === 'verified' ? i18n.t('payment.verified') :
                   method.verificationStatus === 'pending' ? i18n.t('payment.pending') :
                   method.verificationStatus === 'failed' ? i18n.t('payment.failed') :
                   i18n.t('payment.unverified')}
                </Text>
              </View>

              {method.cardDetails?.expiryMonth && method.cardDetails?.expiryYear && (
                <Text style={styles.expiryText}>
                  {i18n.t('payment.expires')} {method.cardDetails.expiryMonth}/{method.cardDetails.expiryYear}
                </Text>
              )}
            </View>
          </View>

          <MaterialIcons
            name="chevron-right"
            size={20}
            color={colors.text.secondary}
          />
        </TouchableOpacity>
      ))}
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
    alignItems: 'center',
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
});

export default PaymentMethodsList;
