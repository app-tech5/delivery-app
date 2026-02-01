import i18n from '../i18n';

/**
 * Options de thème disponibles
 */
export const THEME_OPTIONS = [
  { key: 'light', label: i18n.t('settings.lightMode'), icon: 'wb-sunny' },
  { key: 'dark', label: i18n.t('settings.darkMode'), icon: 'nightlight' },
  { key: 'auto', label: i18n.t('settings.autoMode'), icon: 'brightness-auto' }
];

/**
 * Options de langue disponibles
 */
export const LANGUAGE_OPTIONS = [
  { key: 'en', label: 'English', flag: '🇺🇸' },
  { key: 'fr', label: 'Français', flag: '🇫🇷' },
  { key: 'es', label: 'Español', flag: '🇪🇸' },
  { key: 'de', label: 'Deutsch', flag: '🇩🇪' }
];

/**
 * Options de devise disponibles
 */
export const CURRENCY_OPTIONS = [
  { key: 'EUR', label: 'Euro (€)', symbol: '€' },
  { key: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { key: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { key: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' }
];

/**
 * Configuration par défaut des paramètres
 */
export const DEFAULT_SETTINGS = {
  // Notifications
  orderAlerts: true,
  paymentAlerts: true,
  systemUpdates: true,
  marketing: false,

  // Apparence
  theme: 'auto', // 'light', 'dark', 'auto'

  // Localisation
  sound: true,
  vibration: true,

  // Services
  locationServices: true,
  backgroundLocation: false,
  analytics: true,

  // Sécurité
  biometricAuth: false,
  twoFactorAuth: false
};

/**
 * Liens externes pour la section "À propos"
 */
export const EXTERNAL_LINKS = {
  terms: 'https://goodfood.com/terms',
  privacy: 'https://goodfood.com/privacy',
  support: 'https://goodfood.com/support'
};

/**
 * Informations de version
 */
export const APP_INFO = {
  version: '1.0.0',
  build: 'Build 123'
};
