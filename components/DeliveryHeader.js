import React from 'react';
import { View } from 'react-native';
import { deliveryCardStyles as styles } from '../styles/deliveryCardStyles';
import DeliveryOrderInfo from './DeliveryOrderInfo';
import DeliveryAmountInfo from './DeliveryAmountInfo';

const DeliveryHeader = ({ delivery }) => (
  <View style={styles.header}>
    <DeliveryOrderInfo delivery={delivery} />
    <DeliveryAmountInfo delivery={delivery} />
  </View>
);

export default DeliveryHeader;


