import React from 'react';
import { View } from 'react-native';
import { Card } from 'react-native-elements';
import { deliveryCardStyles as styles } from '../styles/deliveryCardStyles';
import DeliveryHeader from './DeliveryHeader';
import DeliveryInfo from './DeliveryInfo';
import DeliveryActions from './DeliveryActions';

const FullDeliveryCard = ({ delivery, onAccept, onStartDelivery, onMarkDelivered, onViewDetails, showActions }) => (
  <Card containerStyle={styles.card}>
    <DeliveryHeader delivery={delivery} />
    <DeliveryInfo delivery={delivery} />

    {showActions && (
      <View style={styles.actions}>
        <DeliveryActions
          delivery={delivery}
          onAccept={onAccept}
          onStartDelivery={onStartDelivery}
          onMarkDelivered={onMarkDelivered}
          onViewDetails={onViewDetails}
        />
      </View>
    )}
  </Card>
);

export default FullDeliveryCard;


