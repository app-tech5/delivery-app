import { useState, useMemo } from 'react';
import { Alert } from 'react-native';
import i18n from '../i18n';
import { generateMockNotifications, NOTIFICATION_FILTERS } from '../utils/mockNotifications';

export const useNotifications = (deliveries, driver) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [readState, setReadState] = useState({});
  const [deletedIds, setDeletedIds] = useState([]);

  const generatedNotifications = useMemo(() => {
    if (!deliveries?.length || !driver) {
      return [];
    }
    return generateMockNotifications(deliveries, driver);
  }, [deliveries, driver]);

  const notifications = useMemo(() => {
    const deleted = new Set(deletedIds);
    return generatedNotifications
      .filter((notification) => !deleted.has(notification.id))
      .map((notification) => ({
        ...notification,
        read: readState[notification.id] ?? notification.read,
      }));
  }, [generatedNotifications, readState, deletedIds]);

  const filteredNotifications = useMemo(() => {
    switch (activeFilter) {
      case 'unread':
        return notifications.filter((n) => !n.read);
      case 'order':
        return notifications.filter((n) => n.type === 'order');
      case 'system':
        return notifications.filter((n) => n.type === 'system');
      case 'promotion':
        return notifications.filter((n) => n.type === 'promotion');
      default:
        return notifications;
    }
  }, [notifications, activeFilter]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const markAsRead = (notificationId) => {
    setReadState((prev) => ({ ...prev, [notificationId]: true }));
    Alert.alert('Success', i18n.t('notifications.markReadSuccess'));
  };

  const markAllAsRead = () => {
    setReadState((prev) => {
      const next = { ...prev };
      generatedNotifications.forEach((notification) => {
        next[notification.id] = true;
      });
      return next;
    });
    Alert.alert('Success', i18n.t('notifications.markAllReadSuccess'));
  };

  const deleteNotification = (notificationId) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDeletedIds((prev) => [...prev, notificationId]);
            Alert.alert('Success', i18n.t('notifications.deleteSuccess'));
          }
        }
      ]
    );
  };

  return {
    notifications,
    filteredNotifications,
    activeFilter,
    setActiveFilter,
    refreshing,
    unreadCount,
    filters: NOTIFICATION_FILTERS,
    onRefresh,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};
