import React from 'react';
import { View, Text } from 'react-native';
import i18n from '../i18n';
import { formatDate } from '../utils';
import { deliveryCardStyles as styles } from '../styles/deliveryCardStyles';

const DeliveryOrderInfo = ({ delivery }) => {
  const getOrderNumber = () => delivery?._id?.slice(-6) || 'N/A';
  const getDeliveryDate = () => delivery?.createdAt || delivery?.updatedAt;

  return (
    <View style={styles.headerLeft}>
      <Text style={styles.id}>{i18n.t('reports.orderPrefix')}{getOrderNumber()}</Text>
      <Text style={styles.date}>
        {formatDate(getDeliveryDate())}
      </Text>
    </View>
  );
};

export default DeliveryOrderInfo;


