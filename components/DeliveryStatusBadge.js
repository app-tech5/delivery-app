import React from 'react';
import { Badge } from 'react-native-elements';
import { colors } from '../global';
import { DELIVERY_STATUSES, DELIVERY_STATUS_LABELS } from '../utils';

const DeliveryStatusBadge = ({ status, compact = false }) => {
  const getStatusLabel = (status) => DELIVERY_STATUS_LABELS[status] || status;

  if (compact) {
    return (
      <Badge
        value={getStatusLabel(status)}
        status={status === DELIVERY_STATUSES.DELIVERED ? 'success' : 'primary'}
        containerStyle={{ flex: 1, alignItems: 'center' }}
      />
    );
  }

  return (
    <Badge
      value={getStatusLabel(status)}
      status={status === DELIVERY_STATUSES.DELIVERED ? 'success' : 'primary'}
      containerStyle={{ marginBottom: 4 }}
    />
  );
};

export default DeliveryStatusBadge;
