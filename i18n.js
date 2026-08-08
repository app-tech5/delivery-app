import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './lang/en.json';
import fr from './lang/fr.json';
import es from './lang/es.json';
import ar from './lang/ar.json';

const i18n = new I18n({ en, fr, es, ar });

i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export const RTL_LOCALES = ['ar'];
export const isRtlLocale = (code) => RTL_LOCALES.includes(String(code || '').split('-')[0]);

export function applyLayoutDirection(locale) {
  const wantRtl = isRtlLocale(locale);
  if (wantRtl !== I18nManager.isRTL) {
    I18nManager.allowRTL(wantRtl);
    I18nManager.forceRTL(wantRtl);
    return { needsReload: true, rtl: wantRtl };
  }
  return { needsReload: false, rtl: wantRtl };
}

let deviceLanguage = 'en';
try {
  if (Localization && Localization.locale) {
    deviceLanguage = Localization.locale.split('-')[0];
  }
} catch (error) {
  console.warn('Error detecting language:', error.message);
}

i18n.locale = i18n.translations[deviceLanguage] ? deviceLanguage : 'en';

export const changeLanguage = async (language) => {
  if (!i18n.translations[language]) {
    console.warn(`Language '${language}' not supported. Available languages:`, Object.keys(i18n.translations));
    return { ok: false };
  }
  i18n.locale = language;
  try {
    await AsyncStorage.setItem('language', language);
  } catch (_) {
    /* ignore */
  }
  const layout = applyLayoutDirection(language);
  return { ok: true, ...layout };
};

export const getCurrentLanguage = () => i18n.locale;

export const isLanguageSupported = (language) => !!i18n.translations[language];

export const supportedLanguages = Object.keys(i18n.translations);

export default i18n;
