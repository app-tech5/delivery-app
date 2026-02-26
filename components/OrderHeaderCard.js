import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';

const OrderHeaderCard = ({ order }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(i18n.locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'accepted': return colors.info;
      case 'out_for_delivery': return colors.primary;
      case 'delivered': return colors.success;
      case 'cancelled': return colors.error;
      default: return colors.text.secondary;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return i18n.t('orderDetails.readyForPickup');
      case 'accepted': return i18n.t('reports.acceptedLabel');
      case 'out_for_delivery': return i18n.t('orderDetails.outForDelivery');
      case 'delivered': return i18n.t('orderDetails.delivered');
      case 'cancelled': return i18n.t('reports.cancelledLabel');
      default: return status;
    }
  };

  return (
    <Card containerStyle={styles.headerCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>
            {i18n.t('orderDetails.orderNumber')}{order._id.slice(-8)}
          </Text>
          <Text style={styles.orderDate}>
            {formatDate(order.createdAt)}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(order.status)}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  headerCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default OrderHeaderCard;


