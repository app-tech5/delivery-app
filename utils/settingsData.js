import i18n from '../i18n';
import { config } from '../config';

export const THEME_OPTIONS = [
  { key: 'light', label: i18n.t('settings.lightMode'), icon: 'wb-sunny' },
  { key: 'dark', label: i18n.t('settings.darkMode'), icon: 'nightlight' },
  { key: 'auto', label: i18n.t('settings.autoMode'), icon: 'brightness-auto' }
];

export const LANGUAGE_OPTIONS = [
  { key: 'en', label: 'English', flag: '🇺🇸' },
  { key: 'fr', label: 'Français', flag: '🇫🇷' }
];

export const CURRENCY_OPTIONS = [
  { key: 'EUR', label: 'EUR (€)', symbol: '€' },
  { key: 'USD', label: 'USD ($)', symbol: '$' },
  { key: 'GBP', label: 'GBP (£)', symbol: '£' },
  { key: 'CAD', label: 'CAD (C$)', symbol: 'C$' }
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
  terms: 'https://example.com/terms',
  privacy: 'https://example.com/privacy',
  support: 'https://example.com/support'
};

export const APP_INFO = {
  version: config.VERSION || '1.0.0',
  build: config.BUILD_NUMBER || '1'
};
