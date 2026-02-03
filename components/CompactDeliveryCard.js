import React from 'react';
import { View, Text } from 'react-native';
import { Card } from 'react-native-elements';
import i18n from '../i18n';
import { formatCurrency, formatDate } from '../utils';
import { deliveryCardStyles as styles } from '../styles/deliveryCardStyles';
import DeliveryStatusBadge from './DeliveryStatusBadge';
import DeliveryActions from './DeliveryActions';

const CompactDeliveryCard = ({ delivery, currency, onAccept, onStartDelivery, onMarkDelivered, onViewDetails, showActions }) => {
  const getOrderNumber = () => delivery?._id?.slice(-6) || 'N/A';
  const getDeliveryDate = () => delivery?.createdAt || delivery?.updatedAt;
  const getDeliveryFee = () => delivery?.delivery?.deliveryFee || 0;

  return (
    <Card containerStyle={styles.compactCard}>
      <View style={styles.compactHeader}>
        <Text style={styles.compactId}>#{getOrderNumber()}</Text>
        <DeliveryStatusBadge status={delivery.status} compact />
        <Text style={styles.compactAmount}>
          {formatCurrency(getDeliveryFee(), currency)}
        </Text>
      </View>

      <Text style={styles.compactAddress}>
        📍 {delivery.delivery?.address || i18n.t('reports.addressNotAvailable')}
      </Text>

      {delivery.user && (
        <Text style={styles.compactCustomer}>
          👤 {delivery.user.name}
        </Text>
      )}

      <Text style={styles.compactDate}>
        {formatDate(getDeliveryDate())}
      </Text>

      {showActions && (
        <DeliveryActions
          delivery={delivery}
          onAccept={onAccept}
          onStartDelivery={onStartDelivery}
          onMarkDelivered={onMarkDelivered}
          onViewDetails={onViewDetails}
        />
      )}
    </Card>
  );
};

export default CompactDeliveryCard;
