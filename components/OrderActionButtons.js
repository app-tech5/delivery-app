import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';

const OrderActionButtons = ({ order, onMarkAsDelivered }) => {
  if (order.status !== 'out_for_delivery') return null;

  return (
    <View style={styles.actionContainer}>
      <Button
        title={i18n.t('orderDetails.markAsDelivered')}
        onPress={onMarkAsDelivered}
        buttonStyle={styles.deliveredButton}
        icon={{
          name: "check-circle",
          type: "material",
          size: 16,
          color: colors.white,
          style: { marginRight: 8 }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  actionContainer: {
    marginBottom: 16,
  },
  deliveredButton: {
    backgroundColor: colors.success,
    borderRadius: 8,
    paddingVertical: 12,
  },
});

export default OrderActionButtons;
