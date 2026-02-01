import { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import i18n from '../i18n';
import { generateMockNotifications, NOTIFICATION_FILTERS } from '../utils/mockNotifications';

/**
 * Hook personnalisé pour gérer les notifications
 * @param {Array} deliveries - Liste des livraisons
 * @param {Object} driver - Objet driver
 * @returns {Object} État et fonctions pour gérer les notifications
 */
export const useNotifications = (deliveries, driver) => {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Générer les notifications au montage et quand deliveries change
  useEffect(() => {
    if (deliveries && driver) {
      const mockNotifications = generateMockNotifications(deliveries, driver);
      setNotifications(mockNotifications);
    }
  }, [deliveries, driver]);

  // Filtrer les notifications selon le filtre actif
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

  // Compter les notifications non lues
  const unreadCount = notifications.filter(n => !n.read).length;

  // Gestionnaire de pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    // Simuler le chargement de nouvelles notifications
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Marquer une notification comme lue
  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    Alert.alert('Success', i18n.t('notifications.markReadSuccess'));
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    Alert.alert('Success', i18n.t('notifications.markAllReadSuccess'));
  };

  // Supprimer une notification
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
