import i18n from '../i18n';

/**
 * Génère des notifications simulées basées sur les livraisons et le driver
 * @param {Array} deliveries - Liste des livraisons
 * @param {Object} driver - Objet driver
 * @returns {Array} Liste des notifications générées
 */
export const generateMockNotifications = (deliveries, driver) => {
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

/**
 * Filtres disponibles pour les notifications
 */
export const NOTIFICATION_FILTERS = [
  { key: 'all', label: i18n.t('notifications.all'), icon: 'notifications' },
  { key: 'unread', label: i18n.t('notifications.unread'), icon: 'notifications-none' },
  { key: 'order', label: i18n.t('notifications.order'), icon: 'local-shipping' },
  { key: 'system', label: i18n.t('notifications.system'), icon: 'info' },
  { key: 'promotion', label: i18n.t('notifications.promotion'), icon: 'local-offer' }
];
