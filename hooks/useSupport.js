import { useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import i18n from '../i18n';
import { CONTACT_ACTIONS } from '../utils/supportData';

export const useSupport = (currency, driver) => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [bugReport, setBugReport] = useState({
    category: 'general',
    priority: 'normal',
    description: ''
  });
  
  const toggleFAQ = (faqId) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };
  
  const submitBugReport = () => {
    if (!bugReport.description.trim()) {
      Alert.alert('Error', 'Please describe the issue before submitting.');
      return;
    }
    
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
  
  const getSystemInfo = () => {
    return {
      appVersion: '1.0.0',
      platform: Platform.OS,
      osVersion: Platform.Version,
      device: 'Unknown Device', 
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

