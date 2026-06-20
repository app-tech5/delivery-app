import React from 'react';
import { View, Text } from 'react-native';
import { useSettings } from '../contexts/SettingContext';
import { formatCurrency, getDriverDeliveryEarnings } from '../utils';
import { deliveryCardStyles as styles } from '../styles/deliveryCardStyles';
import DeliveryStatusBadge from './DeliveryStatusBadge';
import i18n from '../i18n';

const DeliveryAmountInfo = ({ delivery }) => {
  const { currency } = useSettings();

  return (
    <View style={styles.headerRight}>
      <DeliveryStatusBadge status={delivery.status} />
      <Text style={styles.amountLabel}>{i18n.t('reports.deliveryEarnings')}</Text>
      <Text style={styles.amount}>
        {formatCurrency(getDriverDeliveryEarnings(delivery), currency)}
      </Text>
    </View>
  );
};

export default DeliveryAmountInfo;
