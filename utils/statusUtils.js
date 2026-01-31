import i18n from '../i18n';

/**
 * Statuts possibles pour les drivers
 */
export const DRIVER_STATUSES = {
  AVAILABLE: 'available',
  ON_DELIVERY: 'on_delivery',
  OFFLINE: 'offline',
  BUSY: 'busy'
};

/**
 * Statuts possibles pour les livraisons
 */
export const DELIVERY_STATUSES = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

/**
 * Actions possibles sur une livraison selon son statut
 */
export const DELIVERY_ACTIONS = {
  [DELIVERY_STATUSES.PENDING]: ['accept', 'cancel'],
  [DELIVERY_STATUSES.ACCEPTED]: ['start_delivery', 'cancel'],
  [DELIVERY_STATUSES.OUT_FOR_DELIVERY]: ['deliver', 'cancel'],
  [DELIVERY_STATUSES.DELIVERED]: [],
  [DELIVERY_STATUSES.CANCELLED]: []
};

/**
 * Labels pour les statuts de livraison
 */
export const DELIVERY_STATUS_LABELS = {
  [DELIVERY_STATUSES.PENDING]: i18n.t('reports.pendingLabel'),
  [DELIVERY_STATUSES.ACCEPTED]: i18n.t('reports.acceptedLabel'),
  [DELIVERY_STATUSES.OUT_FOR_DELIVERY]: i18n.t('reports.outForDeliveryLabel'),
  [DELIVERY_STATUSES.DELIVERED]: i18n.t('reports.deliveredLabel'),
  [DELIVERY_STATUSES.CANCELLED]: i18n.t('reports.cancelledLabel')
};

/**
 * Labels pour les actions sur les livraisons
 */
export const DELIVERY_ACTION_LABELS = {
  accept: i18n.t('reports.acceptDelivery'),
  start_delivery: i18n.t('reports.startDelivery'),
  deliver: i18n.t('reports.markAsDelivered'),
  cancel: i18n.t('common.cancel')
};

/**
 * Messages de confirmation pour les actions
 */
export const DELIVERY_ACTION_CONFIRMATIONS = {
  accept: i18n.t('reports.acceptDeliveryConfirm'),
  start_delivery: i18n.t('reports.startDeliveryConfirm'),
  deliver: i18n.t('reports.completeDeliveryConfirm'),
  cancel: i18n.t('reports.cancelDeliveryConfirm')
};

/**
 * Vérifie si une action est disponible pour un statut donné
 * @param {string} status - Statut actuel
 * @param {string} action - Action à vérifier
 * @returns {boolean} True si l'action est disponible
 */
export const isActionAvailable = (status, action) => {
  return DELIVERY_ACTIONS[status]?.includes(action) || false;
};

/**
 * Obtient la liste des actions disponibles pour un statut
 * @param {string} status - Statut de la livraison
 * @returns {Array} Liste des actions disponibles
 */
export const getAvailableActions = (status) => {
  return DELIVERY_ACTIONS[status] || [];
};

/**
 * Obtient le prochain statut après une action
 * @param {string} currentStatus - Statut actuel
 * @param {string} action - Action effectuée
 * @returns {string|null} Nouveau statut ou null si invalide
 */
export const getNextStatus = (currentStatus, action) => {
  const transitions = {
    [DELIVERY_STATUSES.PENDING]: {
      accept: DELIVERY_STATUSES.ACCEPTED,
      cancel: DELIVERY_STATUSES.CANCELLED
    },
    [DELIVERY_STATUSES.ACCEPTED]: {
      start_delivery: DELIVERY_STATUSES.OUT_FOR_DELIVERY,
      cancel: DELIVERY_STATUSES.CANCELLED
    },
    [DELIVERY_STATUSES.OUT_FOR_DELIVERY]: {
      deliver: DELIVERY_STATUSES.DELIVERED,
      cancel: DELIVERY_STATUSES.CANCELLED
    }
  };

  return transitions[currentStatus]?.[action] || null;
};

/**
 * Vérifie si un statut est final (ne peut plus changer)
 * @param {string} status - Statut à vérifier
 * @returns {boolean} True si le statut est final
 */
export const isFinalStatus = (status) => {
  return [DELIVERY_STATUSES.DELIVERED, DELIVERY_STATUSES.CANCELLED].includes(status);
};

/**
 * Filtre les livraisons selon leur statut
 * @param {Array} deliveries - Liste des livraisons
 * @param {string} status - Statut à filtrer (ou 'all' pour tout)
 * @returns {Array} Livraisons filtrées
 */
export const filterDeliveriesByStatus = (deliveries, status) => {
  if (status === 'all') return deliveries;
  return deliveries.filter(delivery => delivery.status === status);
};

/**
 * Compte les livraisons par statut
 * @param {Array} deliveries - Liste des livraisons
 * @returns {Object} Objet avec les compteurs par statut
 */
export const countDeliveriesByStatus = (deliveries) => {
  const counts = {
    [DELIVERY_STATUSES.PENDING]: 0,
    [DELIVERY_STATUSES.ACCEPTED]: 0,
    [DELIVERY_STATUSES.OUT_FOR_DELIVERY]: 0,
    [DELIVERY_STATUSES.DELIVERED]: 0,
    [DELIVERY_STATUSES.CANCELLED]: 0
  };

  deliveries.forEach(delivery => {
    if (counts[delivery.status] !== undefined) {
      counts[delivery.status]++;
    }
  });

  return counts;
};
