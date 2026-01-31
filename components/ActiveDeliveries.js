import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Button } from 'react-native-elements';
import { colors } from '../global';
import { formatCurrency, getStatusColor } from '../utils';
import i18n from '../i18n';

const DeliveryCard = ({ order, currency, onOrderDelivered, isLoading }) => (
  <Card key={order._id} containerStyle={styles.deliveryCard}>
    <View style={styles.deliveryHeader}>
      <Text style={styles.deliveryId}>Commande #{order._id.slice(-6)}</Text>
      <Text style={[
        styles.deliveryStatus,
        { color: getStatusColor(order.status) }
      ]}>
        {order.status === 'out_for_delivery' ? i18n.t('driver.onDelivery') : order.status}
      </Text>
    </View>
    <Text style={styles.deliveryAddress}>
      📍 {order.delivery?.address || i18n.t('errors.locationError')}
    </Text>
    {order.user && (
      <Text style={styles.customerInfo}>
        👤 {order.user.name} - {order.user.phone}
      </Text>
    )}
    {order.restaurant && (
      <Text style={styles.restaurantInfo}>
        🏪 {order.restaurant.name}
      </Text>
    )}
    <View style={styles.amountSection}>
      <Text style={styles.amountLabel}>{i18n.t('common.amount')}:</Text>
      <Text style={styles.amountValue}>{order.totalPrice}{currency.symbol}</Text>
    </View>
    <View style={styles.deliveryActions}>
      <Button
        title={i18n.t('driver.orderDelivered')}
        onPress={() => onOrderDelivered(order._id, 'delivered')}
        loading={isLoading}
        buttonStyle={styles.deliverButton}
      />
    </View>
  </Card>
);

const ActiveDeliveries = ({ deliveries, currency, onOrderDelivered, isLoading }) => {
  if (!deliveries || deliveries.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{i18n.t('home.activeDeliveries')}</Text>
      {deliveries.slice(0, 2).map((order) => (
        <DeliveryCard
          key={order._id}
          order={order}
          currency={currency}
          onOrderDelivered={onOrderDelivered}
          isLoading={isLoading}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 15,
  },
  deliveryCard: {
    borderRadius: 12,
    marginBottom: 10,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  deliveryId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  deliveryStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  deliveryAddress: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 15,
  },
  deliveryActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  customerInfo: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 5,
  },
  restaurantInfo: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 5,
  },
  amountSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  amountLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
  },
  deliverButton: {
    backgroundColor: colors.success,
    borderRadius: 8,
    paddingVertical: 10,
  },
});

export default ActiveDeliveries;
