import { useState, useMemo, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import i18n from '../i18n';
import apiClient from '../api';
import { NOTIFICATION_FILTERS, mapBackendNotifications } from '../utils/notificationUtils';

export const useNotifications = (isAuthenticated, driver) => {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated || !driver) {
      setNotifications([]);
      return;
    }

    try {
      const data = await apiClient.getNotifications();
      setNotifications(mapBackendNotifications(Array.isArray(data) ? data : []));
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert(i18n.t('common.error'), i18n.t('notifications.loadError'));
    }
  }, [isAuthenticated, driver]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const filteredNotifications = useMemo(() => {
    switch (activeFilter) {
      case 'unread':
        return notifications.filter((notification) => !notification.read);
      case 'order':
        return notifications.filter((notification) => notification.type === 'order');
      case 'system':
        return notifications.filter((notification) => notification.type === 'system');
      case 'promotion':
        return notifications.filter((notification) => notification.type === 'promotion');
      default:
        return notifications;
    }
  }, [notifications, activeFilter]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadNotifications();
    } finally {
      setRefreshing(false);
    }
  };

  const markAsRead = async (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      )
    );

    try {
      await apiClient.markNotificationRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      await loadNotifications();
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((notification) => !notification.read).map((n) => n.id);
    if (unreadIds.length === 0) {
      return;
    }

    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));

    try {
      await Promise.all(unreadIds.map((id) => apiClient.markNotificationRead(id)));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      await loadNotifications();
    }
  };

  const deleteNotification = (notificationId) => {
    Alert.alert(
      i18n.t('notifications.delete'),
      i18n.t('notifications.deleteConfirm'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('notifications.delete'),
          style: 'destructive',
          onPress: async () => {
            setNotifications((prev) =>
              prev.filter((notification) => notification.id !== notificationId)
            );

            try {
              await apiClient.deleteNotification(notificationId);
            } catch (error) {
              console.error('Error deleting notification:', error);
              await loadNotifications();
            }
          },
        },
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
    deleteNotification,
  };
};
