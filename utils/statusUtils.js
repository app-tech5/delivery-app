import { colors } from '../global';

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
 * Labels des statuts de driver
 */
export const DRIVER_STATUS_LABELS = {
  [DRIVER_STATUSES.AVAILABLE]: 'Disponible',
  [DRIVER_STATUSES.ON_DELIVERY]: 'En livraison',
  [DRIVER_STATUSES.OFFLINE]: 'Hors ligne',
  [DRIVER_STATUSES.BUSY]: 'Occupé'
};

/**
 * Couleurs des statuts de driver
 */
export const DRIVER_STATUS_COLORS = {
  [DRIVER_STATUSES.AVAILABLE]: colors.success,
  [DRIVER_STATUSES.ON_DELIVERY]: colors.primary,
  [DRIVER_STATUSES.OFFLINE]: colors.text.secondary,
  [DRIVER_STATUSES.BUSY]: colors.warning
};

/**
 * Statuts possibles pour les transactions
 */
export const TRANSACTION_STATUSES = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  FAILED: 'failed'
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
 * Labels des statuts de livraison
 */
export const DELIVERY_STATUS_LABELS = {
  [DELIVERY_STATUSES.PENDING]: 'En attente',
  [DELIVERY_STATUSES.ACCEPTED]: 'Acceptée',
  [DELIVERY_STATUSES.OUT_FOR_DELIVERY]: 'En livraison',
  [DELIVERY_STATUSES.DELIVERED]: 'Livrée',
  [DELIVERY_STATUSES.CANCELLED]: 'Annulée'
};

/**
 * Couleurs des statuts de livraison
 */
export const DELIVERY_STATUS_COLORS = {
  [DELIVERY_STATUSES.PENDING]: colors.warning,
  [DELIVERY_STATUSES.ACCEPTED]: colors.primary,
  [DELIVERY_STATUSES.OUT_FOR_DELIVERY]: colors.info,
  [DELIVERY_STATUSES.DELIVERED]: colors.success,
  [DELIVERY_STATUSES.CANCELLED]: colors.error
};

/**
 * Types de transaction possibles
 */
export const TRANSACTION_TYPES = {
  DELIVERY_FEE: 'delivery_fee',
  BONUS: 'bonus',
  PENALTY: 'penalty'
};

/**
 * Couleurs des types de transaction
 */
export const TRANSACTION_TYPE_COLORS = {
  [TRANSACTION_TYPES.DELIVERY_FEE]: colors.success,
  [TRANSACTION_TYPES.BONUS]: colors.primary,
  [TRANSACTION_TYPES.PENALTY]: colors.error
};

/**
 * Icônes des types de transaction
 */
export const TRANSACTION_TYPE_ICONS = {
  [TRANSACTION_TYPES.DELIVERY_FEE]: 'truck-delivery',
  [TRANSACTION_TYPES.BONUS]: 'gift',
  [TRANSACTION_TYPES.PENALTY]: 'alert-circle'
};

/**
 * Retourne le label associé à un statut de driver
 * @param {string} status - Statut du driver
 * @returns {string} Label du statut
 */
export const getDriverStatusLabel = (status) => {
  return DRIVER_STATUS_LABELS[status] || status;
};

/**
 * Retourne la couleur associée à un statut de driver
 * @param {string} status - Statut du driver
 * @returns {string} Couleur hex
 */
export const getDriverStatusColor = (status) => {
  return DRIVER_STATUS_COLORS[status] || colors.text.secondary;
};

/**
 * Retourne la couleur associée au type de transaction
 * @param {string} type - Type de transaction
 * @returns {string} Couleur hex
 */
export const getTransactionTypeColor = (type) => {
  return TRANSACTION_TYPE_COLORS[type] || colors.text.secondary;
};

/**
 * Retourne l'icône associée au type de transaction
 * @param {string} type - Type de transaction
 * @returns {string} Nom de l'icône Material Community
 */
export const getTransactionTypeIcon = (type) => {
  return TRANSACTION_TYPE_ICONS[type] || 'cash';
};

/**
 * Vérifie si un statut de driver est actif
 * @param {string} status - Statut du driver
 * @returns {boolean} True si actif
 */
export const isDriverStatusActive = (status) => {
  return [DRIVER_STATUSES.AVAILABLE, DRIVER_STATUSES.ON_DELIVERY].includes(status);
};

/**
 * Obtient le statut d'affichage pour une transaction
 * @param {string} status - Statut de la transaction
 * @returns {string} Label du statut
 */
export const getTransactionStatusLabel = (status) => {
  switch (status) {
    case TRANSACTION_STATUSES.COMPLETED:
      return 'Completed';
    case TRANSACTION_STATUSES.PENDING:
      return 'Pending';
    case TRANSACTION_STATUSES.FAILED:
      return 'Failed';
    default:
      return status;
  }
};