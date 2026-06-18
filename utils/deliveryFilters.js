import i18n from '../i18n';
import { DELIVERY_STATUSES, DELIVERY_STATUS_LABELS } from './statusUtils';

export const getDeliveryFilters = () => [
  {
    key: 'all',
    label: i18n.t('common.all'),
    icon: 'format-list-bulleted',
    iconType: 'material-community',
  },
  {
    key: DELIVERY_STATUSES.PENDING,
    label: DELIVERY_STATUS_LABELS[DELIVERY_STATUSES.PENDING],
    icon: 'clock-outline',
    iconType: 'material-community',
  },
  {
    key: DELIVERY_STATUSES.ACCEPTED,
    label: DELIVERY_STATUS_LABELS[DELIVERY_STATUSES.ACCEPTED],
    icon: 'check-circle-outline',
    iconType: 'material-community',
  },
  {
    key: DELIVERY_STATUSES.OUT_FOR_DELIVERY,
    label: DELIVERY_STATUS_LABELS[DELIVERY_STATUSES.OUT_FOR_DELIVERY],
    icon: 'truck-delivery',
    iconType: 'material-community',
  },
  {
    key: DELIVERY_STATUSES.DELIVERED,
    label: DELIVERY_STATUS_LABELS[DELIVERY_STATUSES.DELIVERED],
    icon: 'check-circle',
    iconType: 'material-community',
  },
  {
    key: DELIVERY_STATUSES.CANCELLED,
    label: DELIVERY_STATUS_LABELS[DELIVERY_STATUSES.CANCELLED],
    icon: 'close-circle',
    iconType: 'material-community',
  },
];
