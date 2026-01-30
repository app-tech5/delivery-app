import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions
} from 'react-native';
import { Card, Icon, Badge, Button } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';

const { width } = Dimensions.get('window');

// Données de notifications simulées (en production, viendrait du backend)
const generateMockNotifications = (deliveries, driver) => {
  const notifications = [];

  // Notifications basées sur les livraisons
  deliveries.forEach((delivery, index) => {
    const baseTime = new Date(delivery.createdAt || delivery.updatedAt);
    const timeOffset = index * 30 * 60 * 1000; // 30 minutes entre chaque
    const notificationTime = new Date(baseTime.getTime() + timeOffset);

    // Notification de nouvelle commande
    if (delivery.status === 'pending' || delivery.status === 'accepted') {
      notifications.push({
        id: `order_${delivery._id}_new`,
        type: 'order',
        title: i18n.t('notifications.newOrder'),
        message: `Order #${delivery._id.slice(-6)} is available for pickup`,
        timestamp: new Date(notificationTime.getTime() - 10 * 60 * 1000), // 10 min avant
        read: Math.random() > 0.5,
        data: { orderId: delivery._id }
      });
    }

    // Notification d'acceptation
    if (delivery.status === 'accepted') {
      notifications.push({
        id: `order_${delivery._id}_accepted`,
        type: 'order',
        title: i18n.t('notifications.orderAccepted'),
        message: `You accepted order #${delivery._id.slice(-6)}`,
        timestamp: new Date(notificationTime.getTime() + 5 * 60 * 1000), // 5 min après
        read: Math.random() > 0.3,
        data: { orderId: delivery._id }
      });
    }

    // Notification de livraison terminée
    if (delivery.status === 'delivered') {
      notifications.push({
        id: `order_${delivery._id}_delivered`,
        type: 'order',
        title: i18n.t('notifications.orderDelivered'),
        message: `Order #${delivery._id.slice(-6)} has been delivered successfully`,
        timestamp: notificationTime,
        read: Math.random() > 0.2,
        data: { orderId: delivery._id }
      });

      // Notification de paiement reçu
      notifications.push({
        id: `payment_${delivery._id}`,
        type: 'system',
        title: i18n.t('notifications.paymentReceived'),
        message: `Payment received for order #${delivery._id.slice(-6)}: €${(delivery.delivery?.deliveryFee || 0).toFixed(2)}`,
        timestamp: new Date(notificationTime.getTime() + 15 * 60 * 1000), // 15 min après livraison
        read: Math.random() > 0.4,
        data: { orderId: delivery._id, amount: delivery.delivery?.deliveryFee || 0 }
      });
    }
  });

  // Notifications système simulées
  const systemNotifications = [
    {
      id: 'system_update_1',
      type: 'system',
      title: i18n.t('notifications.systemUpdate'),
      message: 'New features available in the app. Check out the latest updates!',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 jours
      read: false
    },
    {
      id: 'promo_1',
      type: 'promotion',
      title: i18n.t('notifications.promoCode'),
      message: 'Use code DELIVERY20 for 20% off your next delivery bonus!',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 jours
      read: true
    },
    {
      id: 'rating_1',
      type: 'system',
      title: i18n.t('notifications.ratingReceived'),
      message: 'New 5-star rating received from customer for order #1234',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 jour
      read: false
    },
    {
      id: 'bonus_1',
      type: 'system',
      title: i18n.t('notifications.bonusEarned'),
      message: 'Performance bonus earned: €15.00 for completing 10 deliveries this week!',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 jours
      read: true
    }
  ];

  return [...notifications, ...systemNotifications].sort((a, b) =>
    new Date(b.timestamp) - new Date(a.timestamp)
  );
};

export default function NotificationsScreen() {
  const { deliveries, isAuthenticated, driver } = useDriver();

  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Filtres disponibles
  const filters = [
    { key: 'all', label: i18n.t('notifications.all'), icon: 'notifications' },
    { key: 'unread', label: i18n.t('notifications.unread'), icon: 'notifications-none' },
    { key: 'order', label: i18n.t('notifications.order'), icon: 'local-shipping' },
    { key: 'system', label: i18n.t('notifications.system'), icon: 'info' },
    { key: 'promotion', label: i18n.t('notifications.promotion'), icon: 'local-offer' }
  ];

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

  // Formater le temps relatif
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return i18n.t('notifications.justNow');
    if (minutes < 60) return `${minutes} ${i18n.t('notifications.minutesAgo')}`;
    if (hours < 24) return `${hours} ${i18n.t('notifications.hoursAgo')}`;
    return `${days} ${i18n.t('notifications.daysAgo')}`;
  };

  // Obtenir la couleur selon le type
  const getNotificationColor = (type) => {
    switch (type) {
      case 'order': return colors.primary;
      case 'system': return colors.info;
      case 'promotion': return colors.success;
      default: return colors.text.secondary;
    }
  };

  // Obtenir l'icône selon le type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order': return 'local-shipping';
      case 'system': return 'info';
      case 'promotion': return 'local-offer';
      default: return 'notifications';
    }
  };

  // Vérifier l'authentification
  if (!isAuthenticated || !driver) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.title}>{i18n.t('home.reconnect')}</Text>
          <Text style={styles.subtitle}>Please reconnect to view notifications</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{i18n.t('notifications.title')}</Text>
          {unreadCount > 0 && (
            <Badge
              value={unreadCount}
              status="error"
              containerStyle={styles.badgeContainer}
            />
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>{i18n.t('notifications.markAllAsRead')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filtres */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => setActiveFilter(filter.key)}
              style={[
                styles.filterButton,
                activeFilter === filter.key && styles.filterButtonActive
              ]}
            >
              <Icon
                name={filter.icon}
                type="material"
                size={18}
                color={activeFilter === filter.key ? colors.white : colors.primary}
              />
              <Text style={[
                styles.filterText,
                activeFilter === filter.key && styles.filterTextActive
              ]}>
                {filter.label}
              </Text>
              {filter.key === 'unread' && unreadCount > 0 && (
                <Badge
                  value={unreadCount}
                  status="error"
                  containerStyle={styles.filterBadge}
                  textStyle={styles.filterBadgeText}
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Liste des notifications */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon
              name="notifications-none"
              type="material"
              size={64}
              color={colors.text.secondary}
            />
            <Text style={styles.emptyTitle}>
              {activeFilter === 'all'
                ? i18n.t('notifications.noNotifications')
                : `No ${activeFilter} notifications`
              }
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === 'all'
                ? 'You\'re all caught up!'
                : `No notifications in this category yet.`
              }
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {filteredNotifications.map((notification) => (
              <Card key={notification.id} containerStyle={[
                styles.notificationCard,
                !notification.read && styles.unreadCard
              ]}>
                <View style={styles.notificationHeader}>
                  <View style={styles.notificationIcon}>
                    <Icon
                      name={getNotificationIcon(notification.type)}
                      type="material"
                      size={20}
                      color={getNotificationColor(notification.type)}
                    />
                  </View>

                  <View style={styles.notificationContent}>
                    <Text style={[
                      styles.notificationTitle,
                      !notification.read && styles.unreadTitle
                    ]}>
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {formatTimeAgo(notification.timestamp)}
                    </Text>
                  </View>

                  {!notification.read && (
                    <View style={styles.unreadIndicator} />
                  )}
                </View>

                <Text style={styles.notificationMessage}>
                  {notification.message}
                </Text>

                <View style={styles.notificationActions}>
                  {!notification.read && (
                    <Button
                      title={i18n.t('notifications.markAsRead')}
                      onPress={() => markAsRead(notification.id)}
                      buttonStyle={styles.markReadButton}
                      titleStyle={styles.markReadButtonText}
                    />
                  )}
                  <Button
                    title={i18n.t('notifications.delete')}
                    onPress={() => deleteNotification(notification.id)}
                    buttonStyle={styles.deleteButton}
                    titleStyle={styles.deleteButtonText}
                    icon={
                      <Icon
                        name="delete"
                        type="material"
                        size={16}
                        color={colors.error}
                        style={{ marginRight: 4 }}
                      />
                    }
                  />
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Espace en bas pour le scroll */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 20,
    textAlign: 'center',
  },

  // Header
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginRight: 12,
  },
  badgeContainer: {
    marginTop: -8,
  },
  markAllButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  markAllText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },

  // Filters
  filtersContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  filtersScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: 6,
    marginRight: 4,
  },
  filterTextActive: {
    color: colors.white,
  },
  filterBadge: {
    marginTop: -8,
    marginLeft: 4,
  },
  filterBadgeText: {
    fontSize: 10,
  },

  // ScrollView and content
  scrollView: {
    flex: 1,
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Notifications list
  notificationsList: {
    padding: 16,
  },
  notificationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    backgroundColor: 'rgba(0, 123, 255, 0.05)',
  },

  // Notification header
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  unreadTitle: {
    color: colors.primary,
    fontWeight: '700',
  },
  notificationTime: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },

  // Notification message
  notificationMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },

  // Notification actions
  notificationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  markReadButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
    marginRight: 8,
  },
  markReadButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.error,
  },

  // Bottom spacer
  bottomSpacer: {
    height: 20,
  },
});
