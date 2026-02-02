// Export de toutes les fonctions utilitaires depuis un seul endroit

// Currency utilities
export {
  formatCurrency,
  getCurrency,
  getCurrencySymbol,
  getCurrencyCode,
  findCurrencyByCode,
  isCurrencySupported,
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES
} from './currencyUtils';

// Date utilities
export {
  formatDate,
  formatTime,
  formatDateTime,
  formatTimeAgo,
  isToday,
  isYesterday,
  getStartOfDay,
  getEndOfDay,
  getDaysDifference
} from './dateUtils';

// Status utilities
export {
  DRIVER_STATUSES,
  DRIVER_STATUS_LABELS,
  DRIVER_STATUS_COLORS,
  DELIVERY_STATUSES,
  DELIVERY_STATUS_LABELS,
  DELIVERY_STATUS_COLORS,
  TRANSACTION_STATUSES,
  TRANSACTION_TYPES,
  TRANSACTION_TYPE_COLORS,
  TRANSACTION_TYPE_ICONS,
  getDriverStatusLabel,
  getDriverStatusColor,
  getTransactionTypeColor,
  getTransactionTypeIcon,
  getTransactionStatusLabel,
  isDriverStatusActive
} from './statusUtils';

// Storage utilities
export {
  updateDriverCache,
  clearDriverCache,
  getDriverFromCache,
  getDriverTokenFromCache,
  hasDriverCache,
  saveToStorage,
  getFromStorage,
  removeFromStorage,
  multiRemoveFromStorage,
  STORAGE_KEYS
} from './storageUtils';

// Legacy utilities (pour compatibilité)
export {
  getStatusLabel,
  INITIAL_STATS,
  isDriverAuthenticated
} from './driverUtils';

export {
  calculateTransactionStats,
  filterTransactionsByPeriod
} from './transactionUtils';

export {
  getSettingsCacheInfo,
  getLanguage,
  getAppName,
  resetSettingsState,
  DEFAULT_LANGUAGE,
  DEFAULT_APP_NAME
} from './settingsUtils';

export {
  getStatusColor,
  getTrendIcon,
  formatOrderNumber,
  getRatingColor,
  truncateText,
  calculatePeriodStats,
  getNotificationColor,
  getNotificationIcon
} from './formatters';

// Cache utilities
export {
  loadNearbyRestaurantsWithSmartCache
} from './cacheUtils';

// Location utilities
export {
  getDriverLocation,
  getActiveDeliveries
} from './locationUtils';