import { useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import i18n from '../i18n';
import { CONTACT_ACTIONS } from '../utils/supportData';

/**
 * Hook personnalisé pour gérer la logique du support
 * @param {Object} currency - Objet devise des paramètres
 * @param {Object} driver - Objet driver (optionnel)
 * @returns {Object} État et fonctions pour gérer le support
 */
export const useSupport = (currency, driver) => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [bugReport, setBugReport] = useState({
    category: 'general',
    priority: 'normal',
    description: ''
  });

  // Basculer l'expansion d'une FAQ
  const toggleFAQ = (faqId) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  // Soumettre un rapport de bug
  const submitBugReport = () => {
    if (!bugReport.description.trim()) {
      Alert.alert('Error', 'Please describe the issue before submitting.');
      return;
    }

    // Simulation d'envoi
    Alert.alert(
      'Success',
      i18n.t('support.reportSent'),
      [
        {
          text: 'OK',
          onPress: () => {
            setBugReport({
              category: 'general',
              priority: 'normal',
              description: ''
            });
          }
        }
      ]
    );
  };

  // Gestionnaire d'actions de contact
  const handleContactAction = (actionType) => {
    switch (actionType) {
      case 'call':
        Linking.openURL('tel:+15551234567');
        break;
      case 'email':
        Linking.openURL('mailto:support@goodfood.com');
        break;
      case 'chat':
        Alert.alert('Chat', 'Live chat feature coming soon!');
        break;
      default:
        break;
    }
  };

  // Obtenir les informations système
  const getSystemInfo = () => {
    return {
      appVersion: '1.0.0',
      platform: Platform.OS,
      osVersion: Platform.Version,
      device: 'Unknown Device', // En production, utiliser DeviceInfo ou similaire
      currency: currency?.code || 'EUR'
    };
  };

  const systemInfo = getSystemInfo();

  return {
    expandedFAQ,
    bugReport,
    setBugReport,
    systemInfo,
    toggleFAQ,
    submitBugReport,
    handleContactAction,
    driver
  };
};
