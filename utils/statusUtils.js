import { colors } from '../global';
import i18n from '../i18n';

export const DRIVER_STATUSES = {
  AVAILABLE: 'available',
  ON_DELIVERY: 'on_delivery',
  OFFLINE: 'offline',
  BUSY: 'busy'
};

const DRIVER_STATUS_I18N_KEYS = {
  [DRIVER_STATUSES.AVAILABLE]: 'driver.available',
  [DRIVER_STATUSES.ON_DELIVERY]: 'driver.onDelivery',
  [DRIVER_STATUSES.OFFLINE]: 'driver.offline',
  [DRIVER_STATUSES.BUSY]: 'driver.busy',
};

export const DRIVER_STATUS_COLORS = {
  [DRIVER_STATUSES.AVAILABLE]: colors.success,
  [DRIVER_STATUSES.ON_DELIVERY]: colors.primary,
  [DRIVER_STATUSES.OFFLINE]: colors.text.secondary,
  [DRIVER_STATUSES.BUSY]: colors.warning
};

export const TRANSACTION_STATUSES = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  FAILED: 'failed'
};

export const DELIVERY_STATUSES = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

const DELIVERY_STATUS_I18N_KEYS = {
  [DELIVERY_STATUSES.PENDING]: 'reports.pendingLabel',
  [DELIVERY_STATUSES.ACCEPTED]: 'reports.acceptedLabel',
  [DELIVERY_STATUSES.OUT_FOR_DELIVERY]: 'reports.outForDeliveryLabel',
  [DELIVERY_STATUSES.DELIVERED]: 'reports.deliveredLabel',
  [DELIVERY_STATUSES.CANCELLED]: 'reports.cancelledLabel',
};

export const DELIVERY_STATUS_COLORS = {
  [DELIVERY_STATUSES.PENDING]: colors.warning,
  [DELIVERY_STATUSES.ACCEPTED]: colors.primary,
  [DELIVERY_STATUSES.OUT_FOR_DELIVERY]: colors.info,
  [DELIVERY_STATUSES.DELIVERED]: colors.success,
  [DELIVERY_STATUSES.CANCELLED]: colors.error
};

export const TRANSACTION_TYPES = {
  DELIVERY_FEE: 'delivery_fee',
  BONUS: 'bonus',
  PENALTY: 'penalty'
};

export const TRANSACTION_TYPE_COLORS = {
  [TRANSACTION_TYPES.DELIVERY_FEE]: colors.success,
  [TRANSACTION_TYPES.BONUS]: colors.primary,
  [TRANSACTION_TYPES.PENALTY]: colors.error
};

export const TRANSACTION_TYPE_ICONS = {
  [TRANSACTION_TYPES.DELIVERY_FEE]: 'truck-delivery',
  [TRANSACTION_TYPES.BONUS]: 'gift',
  [TRANSACTION_TYPES.PENALTY]: 'alert-circle'
};

export const getDriverStatusLabel = (status) => {
  const key = DRIVER_STATUS_I18N_KEYS[status];
  return key ? i18n.t(key) : status;
};

export const getDeliveryStatusLabel = (status) => {
  const key = DELIVERY_STATUS_I18N_KEYS[status];
  return key ? i18n.t(key) : status;
};

export const getDriverStatusColor = (status) => {
  return DRIVER_STATUS_COLORS[status] || colors.text.secondary;
};

export const getTransactionTypeColor = (type) => {
  return TRANSACTION_TYPE_COLORS[type] || colors.text.secondary;
};

export const getTransactionTypeIcon = (type) => {
  return TRANSACTION_TYPE_ICONS[type] || 'cash';
};

export const isDriverStatusActive = (status) => {
  return [DRIVER_STATUSES.AVAILABLE, DRIVER_STATUSES.ON_DELIVERY].includes(status);
};

export const isDriverOnline = (status) => {
  return [
    DRIVER_STATUSES.AVAILABLE,
    DRIVER_STATUSES.BUSY,
    DRIVER_STATUSES.ON_DELIVERY,
  ].includes(status);
};

export const isDriverApproved = (driver) => Boolean(driver?.isApproved);

export const getTransactionStatusLabel = (status) => {
  switch (status) {
    case TRANSACTION_STATUSES.COMPLETED:
      return i18n.t('reports.completedStatus');
    case TRANSACTION_STATUSES.PENDING:
      return i18n.t('reports.pendingLabel');
    case TRANSACTION_STATUSES.FAILED:
      return i18n.t('payment.failed');
    default:
      return status;
  }
};