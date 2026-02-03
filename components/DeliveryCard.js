import React from 'react';
import { useSettings } from '../contexts/SettingContext';
import CompactDeliveryCard from './CompactDeliveryCard';
import FullDeliveryCard from './FullDeliveryCard';

// Composant principal
export default function DeliveryCard({
  delivery,
  onAccept,
  onStartDelivery,
  onMarkDelivered,
  onViewDetails,
  showActions = true,
  compact = false
}) {
  const { currency } = useSettings();

  return compact ? (
    <CompactDeliveryCard
      delivery={delivery}
      currency={currency}
      onAccept={onAccept}
      onStartDelivery={onStartDelivery}
      onMarkDelivered={onMarkDelivered}
      onViewDetails={onViewDetails}
      showActions={showActions}
    />
  ) : (
    <FullDeliveryCard
      delivery={delivery}
      currency={currency}
      onAccept={onAccept}
      onStartDelivery={onStartDelivery}
      onMarkDelivered={onMarkDelivered}
      onViewDetails={onViewDetails}
      showActions={showActions}
    />
  );
}

