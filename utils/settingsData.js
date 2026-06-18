import i18n from '../i18n';

export const THEME_OPTIONS = [
  { key: 'light', label: i18n.t('settings.lightMode'), icon: 'wb-sunny' },
  { key: 'dark', label: i18n.t('settings.darkMode'), icon: 'nightlight' },
  { key: 'auto', label: i18n.t('settings.autoMode'), icon: 'brightness-auto' }
];

export const LANGUAGE_OPTIONS = [
  { key: 'en', label: 'English', flag: '🇺🇸' },
  { key: 'fr', label: 'Français', flag: '🇫🇷' },
  { key: 'es', label: 'Español', flag: '🇪🇸' },
  { key: 'de', label: 'Deutsch', flag: '🇩🇪' }
];

export const CURRENCY_OPTIONS = [
  { key: 'EUR', label: 'Euro (€)', symbol: '€' },
  { key: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { key: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { key: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' }
];

export const DEFAULT_SETTINGS = {
  
  orderAlerts: true,
  paymentAlerts: true,
  systemUpdates: true,
  marketing: false,
  
  theme: 'auto', 
  
  sound: true,
  vibration: true,
  
  locationServices: true,
  backgroundLocation: false,
  analytics: true,
  
  biometricAuth: false,
  twoFactorAuth: false
};

export const EXTERNAL_LINKS = {
  terms: 'https://goodfood.com/terms',
  privacy: 'https://goodfood.com/privacy',
  support: 'https://goodfood.com/support'
};

export const APP_INFO = {
  version: '1.0.0',
  build: 'Build 123'
};

