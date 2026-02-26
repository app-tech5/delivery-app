import React from 'react';
import { View, Text } from 'react-native';
import { useSettings } from '../contexts/SettingContext';
import { formatCurrency } from '../utils';
import { deliveryCardStyles as styles } from '../styles/deliveryCardStyles';
import DeliveryStatusBadge from './DeliveryStatusBadge';

const DeliveryAmountInfo = ({ delivery }) => {
  const { currency } = useSettings();
  const getDeliveryFee = () => delivery?.delivery?.deliveryFee || 0;

  return (
    <View style={styles.headerRight}>
      <DeliveryStatusBadge status={delivery.status} />
      <Text style={styles.amount}>
        {formatCurrency(getDeliveryFee(), currency)}
      </Text>
    </View>
  );
};

export default DeliveryAmountInfo;


