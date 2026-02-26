import React from 'react';
import { View, Text } from 'react-native';
import { Card, Icon } from 'react-native-elements';
import { colors } from '../global';
import { formatCurrency, formatOrderNumber } from '../utils';
import i18n from '../i18n';

const RecentDeliveryCard = ({
  delivery,
  currency,
  showDate = true,
  compact = false,
  style
}) => {
  if (!delivery) return null;

  const orderId = formatOrderNumber(delivery._id);
  const amount = formatCurrency(delivery.delivery?.deliveryFee || 0, currency);
  const address = delivery.delivery?.address || i18n.t('reports.addressNotAvailable');
  const customerName = delivery.user?.name;
  const date = showDate ? new Date(delivery.createdAt || delivery.updatedAt).toLocaleDateString(i18n.locale) : null;

  if (compact) {
    // Version compacte pour les listes denses
    return (
      <View style={[styles.compactContainer, style]}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactOrderId}>
            {i18n.t('reports.orderPrefix')}{orderId}
          </Text>
          <Text style={styles.compactAmount}>{amount}</Text>
        </View>
        <Text style={styles.compactAddress} numberOfLines={1}>
          📍 {address}
        </Text>
      </View>
    );
  }

  // Version complète par défaut
  return (
    <Card containerStyle={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={styles.orderId}>
          {i18n.t('reports.orderPrefix')}{orderId}
        </Text>
        {showDate && (
          <Text style={styles.date}>{date}</Text>
        )}
      </View>

      <View style={styles.details}>
        <Text style={styles.address}>
          📍 {address}
        </Text>

        {customerName && (
          <Text style={styles.customer}>
            👤 {customerName}
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.amount}>
          {amount}
        </Text>
        <View style={styles.status}>
          <Icon
            name="check-circle"
            type="material"
            size={14}
            color={colors.success}
          />
          <Text style={styles.statusText}>{i18n.t('reports.delivered')}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = {
  // Version complète
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  date: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  details: {
    marginBottom: 12,
  },
  address: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 4,
    lineHeight: 20,
  },
  customer: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: colors.success,
    marginLeft: 4,
    fontWeight: '500',
  },

  // Version compacte
  compactContainer: {
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  compactOrderId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  compactAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  compactAddress: {
    fontSize: 12,
    color: colors.text.secondary,
  },
};

export default RecentDeliveryCard;


