import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

// Import des fichiers de traduction
import en from './lang/en.json';

const i18n = new I18n({
  en
});

// Configuration des options
i18n.enableFallback = true; // Utilise la langue de fallback si une clé n'existe pas
i18n.defaultLocale = 'en'; // Langue par défaut

// Détection automatique de la langue du device
let deviceLanguage = 'en'; // Défaut anglais
try {
  if (Localization && Localization.locale) {
    deviceLanguage = Localization.locale.split('-')[0]; // 'en-US' devient 'en'
  }
} catch (error) {
  console.warn('Error detecting language:', error.message);
}

// Définition de la langue avec fallback
i18n.locale = i18n.translations[deviceLanguage] ? deviceLanguage : 'en';

// Fonction utilitaire pour changer de langue
export const changeLanguage = (language) => {
  if (i18n.translations[language]) {
    i18n.locale = language;
  } else {
    console.warn(`Language '${language}' not supported. Available languages:`, Object.keys(i18n.translations));
  }
};

// Fonction pour obtenir la langue actuelle
export const getCurrentLanguage = () => i18n.locale;

// Fonction pour vérifier si une langue est supportée
export const isLanguageSupported = (language) => !!i18n.translations[language];

// Liste des langues supportées
export const supportedLanguages = Object.keys(i18n.translations);

export default i18n;


