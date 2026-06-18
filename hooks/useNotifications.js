import { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import i18n from '../i18n';
import { generateMockNotifications, NOTIFICATION_FILTERS } from '../utils/mockNotifications';

export const useNotifications = (deliveries, driver) => {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    if (deliveries && driver) {
      const mockNotifications = generateMockNotifications(deliveries, driver);
      setNotifications(mockNotifications);
    }
  }, [deliveries, driver]);
  
  const filteredNotifications = useMemo(() => {
    switch (activeFilter) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'order':
        return notifications.filter(n => n.type === 'order');
      case 'system':
        return notifications.filter(n => n.type === 'system');
      case 'promotion':
        return notifications.filter(n => n.type === 'promotion');
      default:
        return notifications;
    }
  }, [notifications, activeFilter]);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const onRefresh = () => {
    setRefreshing(true);
    
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    Alert.alert('Success', i18n.t('notifications.markReadSuccess'));
  };
  
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
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
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
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

