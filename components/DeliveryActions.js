import React from 'react';
import { View } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { DELIVERY_STATUSES } from '../utils';
import { deliveryCardStyles as styles } from '../styles/deliveryCardStyles';

const DeliveryActions = ({ delivery, onAccept, onStartDelivery, onMarkDelivered, onViewDetails }) => {
  const getActionButton = () => {
    switch (delivery.status) {
      case DELIVERY_STATUSES.PENDING:
        return (
          <Button
            title={i18n.t('reports.acceptButton')}
            onPress={() => onAccept(delivery._id)}
            buttonStyle={styles.acceptButton}
            icon={
              <Icon
                name="check"
                type="material"
                size={16}
                color={colors.white}
                style={{ marginRight: 8 }}
              />
            }
          />
        );

      case DELIVERY_STATUSES.ACCEPTED:
        return (
          <Button
            title={i18n.t('reports.startButton')}
            onPress={() => onStartDelivery(delivery._id)}
            buttonStyle={styles.startButton}
          />
        );

      case DELIVERY_STATUSES.OUT_FOR_DELIVERY:
        return (
          <Button
            title={i18n.t('reports.deliveredButton')}
            onPress={() => onMarkDelivered(delivery._id)}
            buttonStyle={styles.deliveredButton}
            icon={
              <Icon
                name="check-circle"
                type="material"
                size={16}
                color={colors.white}
                style={{ marginRight: 8 }}
              />
            }
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.actionsContainer}>
      {onViewDetails && (
        <Button
          title="View Details"
          onPress={() => onViewDetails(delivery._id)}
          buttonStyle={styles.detailsButton}
          icon={
            <Icon
              name="eye"
              type="material"
              size={16}
              color={colors.primary}
              style={{ marginRight: 8 }}
            />
          }
        />
      )}
      {getActionButton()}
    </View>
  );
};

export default DeliveryActions;
