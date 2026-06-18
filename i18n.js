import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

import en from './lang/en.json';

const i18n = new I18n({
  en
});

i18n.enableFallback = true; 
i18n.defaultLocale = 'en'; 

let deviceLanguage = 'en'; 
try {
  if (Localization && Localization.locale) {
    deviceLanguage = Localization.locale.split('-')[0]; 
  }
} catch (error) {
  console.warn('Error detecting language:', error.message);
}

i18n.locale = i18n.translations[deviceLanguage] ? deviceLanguage : 'en';

export const changeLanguage = (language) => {
  if (i18n.translations[language]) {
    i18n.locale = language;
  } else {
    console.warn(`Language '${language}' not supported. Available languages:`, Object.keys(i18n.translations));
  }
};

export const getCurrentLanguage = () => i18n.locale;

export const isLanguageSupported = (language) => !!i18n.translations[language];

export const supportedLanguages = Object.keys(i18n.translations);

export default i18n;

