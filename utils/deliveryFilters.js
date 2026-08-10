import i18n from '../i18n';
import { DELIVERY_STATUSES, getDeliveryStatusLabel } from './statusUtils';

// Prefer material icons — material-community often renders as □ / ? on RN web.
export const getDeliveryFilters = () => [
  {
    key: 'all',
    label: i18n.t('common.all'),
    icon: 'list',
    iconType: 'material',
  },
  {
    key: DELIVERY_STATUSES.PENDING,
    label: getDeliveryStatusLabel(DELIVERY_STATUSES.PENDING),
    icon: 'schedule',
    iconType: 'material',
  },
  {
    key: DELIVERY_STATUSES.ACCEPTED,
    label: getDeliveryStatusLabel(DELIVERY_STATUSES.ACCEPTED),
    icon: 'check-circle-outline',
    iconType: 'material',
  },
  {
    key: DELIVERY_STATUSES.OUT_FOR_DELIVERY,
    label: getDeliveryStatusLabel(DELIVERY_STATUSES.OUT_FOR_DELIVERY),
    icon: 'local-shipping',
    iconType: 'material',
  },
  {
    key: DELIVERY_STATUSES.DELIVERED,
    label: getDeliveryStatusLabel(DELIVERY_STATUSES.DELIVERED),
    icon: 'check-circle',
    iconType: 'material',
  },
  {
    key: DELIVERY_STATUSES.CANCELLED,
    label: getDeliveryStatusLabel(DELIVERY_STATUSES.CANCELLED),
    icon: 'cancel',
    iconType: 'material',
  },
];
