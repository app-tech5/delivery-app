import React from 'react';
import { View } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { DELIVERY_STATUSES } from '../utils';
import { deliveryCardStyles as styles } from '../styles/deliveryCardStyles';

const DeliveryActions = ({ delivery, onAccept, onStartDelivery, onMarkDelivered, onViewDetails }) => {
  const renderButton = ({
    title,
    onPress,
    buttonStyle,
    titleStyle,
    iconName,
    iconColor = colors.white,
  }) => (
    <Button
      title={title}
      onPress={onPress}
      containerStyle={styles.actionButtonContainer}
      buttonStyle={[styles.actionButton, buttonStyle]}
      titleStyle={[styles.actionButtonTitle, titleStyle]}
      iconContainerStyle={styles.actionIconContainer}
      icon={
        iconName ? (
          <Icon name={iconName} type="material" size={16} color={iconColor} />
        ) : undefined
      }
    />
  );

  const getActionButton = () => {
    switch (delivery.status) {
      case DELIVERY_STATUSES.PENDING:
        return renderButton({
          title: i18n.t('reports.acceptButton'),
          onPress: () => onAccept(delivery._id),
          buttonStyle: styles.acceptButton,
          iconName: 'check',
        });

      case DELIVERY_STATUSES.ACCEPTED:
        return renderButton({
          title: i18n.t('reports.startButton'),
          onPress: () => onStartDelivery(delivery._id),
          buttonStyle: styles.startButton,
        });

      case DELIVERY_STATUSES.OUT_FOR_DELIVERY:
        return renderButton({
          title: i18n.t('reports.outForDeliveryButton'),
          onPress: () => onMarkDelivered(delivery._id),
          buttonStyle: styles.outForDeliveryButton,
          iconName: 'check-circle',
        });

      default:
        return null;
    }
  };

  return (
    <View style={styles.actionsContainer}>
      {onViewDetails &&
        renderButton({
          title: i18n.t('reports.viewDetails'),
          onPress: () => onViewDetails(delivery._id),
          buttonStyle: styles.detailsButton,
          titleStyle: styles.detailsButtonTitle,
          iconName: 'visibility',
          iconColor: colors.primary,
        })}
      {getActionButton()}
    </View>
  );
};

export default DeliveryActions;
