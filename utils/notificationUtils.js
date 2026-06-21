import i18n from '../i18n';

export const NOTIFICATION_FILTERS = [
  { key: 'all', label: i18n.t('notifications.all'), icon: 'notifications' },
  { key: 'unread', label: i18n.t('notifications.unread'), icon: 'notifications-off' },
  { key: 'order', label: i18n.t('notifications.order'), icon: 'local-shipping' },
  { key: 'system', label: i18n.t('notifications.system'), icon: 'info' },
  { key: 'promotion', label: i18n.t('notifications.promotion'), icon: 'local-offer' },
];

const ORDER_BACKEND_TYPES = new Set([
  'order',
  'order_status',
  'delivery_update',
  'payment',
]);

export function mapBackendNotificationType(backendType) {
  if (ORDER_BACKEND_TYPES.has(backendType)) {
    return 'order';
  }
  if (backendType === 'promotion') {
    return 'promotion';
  }
  return 'system';
}

export function mapBackendNotification(notification) {
  return {
    id: String(notification._id || notification.id),
    type: mapBackendNotificationType(notification.type),
    title: notification.title || '',
    message: notification.message || '',
    timestamp: notification.createdAt || notification.updatedAt,
    read: Boolean(notification.isRead),
    data: notification.relatedEntity
      ? { relatedEntity: notification.relatedEntity, relatedEntityModel: notification.relatedEntityModel }
      : {},
  };
}

export function mapBackendNotifications(notifications = []) {
  return notifications
    .map(mapBackendNotification)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}
