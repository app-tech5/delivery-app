import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card, Chip } from 'react-native-elements';
import { timelineStyles } from '../styles/timelineStyles';
import i18n from '../i18n';

const DeliveryTimelineItem = ({ delivery, isLast, currency, onPress }) => {
  return (
    <View style={timelineStyles.deliveryItem}>
      <View style={timelineStyles.timelineConnector}>
        <View style={timelineStyles.timelineDot} />
        {!isLast && <View style={timelineStyles.timelineLine} />}
      </View>

      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Card containerStyle={timelineStyles.deliveryCard}>
          <View style={timelineStyles.deliveryHeader}>
            <View style={timelineStyles.deliveryInfo}>
              <Text style={timelineStyles.deliveryId}>
                {i18n.t('reports.orderPrefix')}{delivery.id}
              </Text>
              <Text style={timelineStyles.deliveryTime}>
                {delivery.time}
              </Text>
            </View>

            <View style={timelineStyles.deliveryAmount}>
              <Text style={timelineStyles.amountValue}>
                +{delivery.amount}
              </Text>
              <Chip
                title={i18n.t('reports.delivered')}
                buttonStyle={timelineStyles.statusChip}
                titleStyle={timelineStyles.statusChipText}
              />
            </View>
          </View>

          <View style={timelineStyles.deliveryDetails}>
            <Text style={timelineStyles.deliveryAddress}>
              📍 {delivery.address}
            </Text>

            {delivery.customer && (
              <Text style={timelineStyles.customerInfo}>
                👤 {delivery.customer}
              </Text>
            )}

            {delivery.restaurant && (
              <Text style={timelineStyles.restaurantInfo}>
              🏪 {delivery.restaurant}
            </Text>
          )}
        </View>
      </Card>
      </TouchableOpacity>
    </View>
  );
};

export default DeliveryTimelineItem;
