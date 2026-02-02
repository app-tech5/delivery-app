import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Icon } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { formatCurrency } from '../utils';

const OrderSummaryCard = ({ order, currency }) => {
  return (
    <Card containerStyle={styles.summaryCard}>
      <View style={styles.cardHeader}>
        <Icon name="receipt" type="material" size={20} color={colors.primary} />
        <Text style={styles.cardTitle}>{i18n.t('orderDetails.viewReceipt')}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>{i18n.t('orderDetails.subtotal')}</Text>
        <Text style={styles.summaryValue}>
          {formatCurrency(order.subtotal, currency)}
        </Text>
      </View>

      {order.tax && order.tax.amount > 0 && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            {i18n.t('orderDetails.tax')} ({order.tax.rate * 100}%)
          </Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(order.tax.amount, currency)}
          </Text>
        </View>
      )}

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>{i18n.t('orderDetails.deliveryFee')}</Text>
        <Text style={styles.summaryValue}>
          {formatCurrency(order.delivery?.deliveryFee || 0, currency)}
        </Text>
      </View>

      <View style={styles.totalDivider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>{i18n.t('orderDetails.grandTotal')}</Text>
        <Text style={styles.totalValue}>
          {formatCurrency(order.totalPrice, currency)}
        </Text>
      </View>

      <View style={styles.paymentRow}>
        <Text style={styles.paymentLabel}>{i18n.t('orderDetails.paymentMethod')}:</Text>
        <Text style={styles.paymentValue}>
          {order.payment?.method === 'cash' ? 'Cash' :
           order.payment?.method === 'credit_card' ? 'Credit Card' :
           order.payment?.method === 'mobile_money' ? 'Mobile Money' :
           order.payment?.method || 'N/A'}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.background.secondary,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  totalDivider: {
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.background.secondary,
  },
  paymentLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  paymentValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
});

export default OrderSummaryCard;
