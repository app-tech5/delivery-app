import i18n from '../i18n';

/**
 * Filtres de période disponibles pour les transactions
 */
export const PERIOD_FILTERS = [
  { key: 'all', label: i18n.t('common.all'), days: null },
  { key: 'today', label: i18n.t('reports.todayFilter'), days: 0 },
  { key: 'week', label: i18n.t('reports.weekFilter'), days: 7 },
  { key: 'month', label: i18n.t('reports.monthFilter'), days: 30 },
];

/**
 * Types de transactions disponibles
 */
export const TRANSACTION_TYPES = {
  DELIVERY_FEE: 'delivery_fee',
  BONUS: 'bonus',
  PENALTY: 'penalty'
};

/**
 * Statuts de transaction disponibles
 */
export const TRANSACTION_STATUSES = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  FAILED: 'failed'
};


