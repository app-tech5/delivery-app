import React from 'react';
import { View, Text } from 'react-native';
import i18n from '../i18n';
import { deliveryCardStyles as styles } from '../styles/deliveryCardStyles';

const DeliveryInfo = ({ delivery }) => (
  <View style={styles.details}>
    <Text style={styles.address}>
      📍 {delivery.delivery?.address || i18n.t('reports.addressNotAvailable')}
    </Text>

    {delivery.user && (
      <Text style={styles.customer}>
        👤 {delivery.user.name} - {delivery.user.phone}
      </Text>
    )}

    {delivery.restaurant && (
      <Text style={styles.restaurant}>
        🏪 {delivery.restaurant.name}
      </Text>
    )}
  </View>
);

export default DeliveryInfo;
