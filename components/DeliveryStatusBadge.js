import React from 'react';
import { Badge } from 'react-native-elements';
import { colors } from '../global';
import { DELIVERY_STATUSES, getDeliveryStatusLabel } from '../utils';

const DeliveryStatusBadge = ({ status, compact = false }) => {
  const statusLabel = getDeliveryStatusLabel(status);

  if (compact) {
    return (
      <Badge
        value={statusLabel}
        status={status === DELIVERY_STATUSES.DELIVERED ? 'success' : 'primary'}
        containerStyle={{ flex: 1, alignItems: 'center' }}
      />
    );
  }

  return (
    <Badge
      value={statusLabel}
      status={status === DELIVERY_STATUSES.DELIVERED ? 'success' : 'primary'}
      containerStyle={{ marginBottom: 4 }}
    />
  );
};

export default DeliveryStatusBadge;

