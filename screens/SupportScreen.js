import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  Dimensions
} from 'react-native';
import { Card, Icon, Button, Input } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';

const { width } = Dimensions.get('window');

export default function SupportScreen() {
  const { isAuthenticated, driver } = useDriver();
  const { currency } = useSettings();

  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [bugReport, setBugReport] = useState({
    category: 'general',
    priority: 'normal',
    description: ''
  });

  // Données FAQ
  const faqData = [
    {
      id: 'q1',
      question: i18n.t('support.faqs.q1'),
      answer: i18n.t('support.faqs.a1')
    },
    {
      id: 'q2',
      question: i18n.t('support.faqs.q2'),
      answer: i18n.t('support.faqs.a2')
    },
    {
      id: 'q3',
      question: i18n.t('support.faqs.q3'),
      answer: i18n.t('support.faqs.a3')
    },
    {
      id: 'q4',
      question: i18n.t('support.faqs.q4'),
      answer: i18n.t('support.faqs.a4')
    },
    {
      id: 'q5',
      question: i18n.t('support.faqs.q5'),
      answer: i18n.t('support.faqs.a5')
    }
  ];

  // Catégories de rapport de bug
  const categories = [
    { key: 'general', label: i18n.t('support.general') },
    { key: 'technical', label: i18n.t('support.technical') },
    { key: 'payment', label: i18n.t('support.payment') },
    { key: 'account', label: i18n.t('support.account') }
  ];

  // Priorités
  const priorities = [
    { key: 'low', label: i18n.t('support.low'), color: colors.success },
    { key: 'normal', label: i18n.t('support.normal'), color: colors.warning },
    { key: 'urgent', label: i18n.t('support.urgent'), color: colors.error }
  ];

  // Actions de contact
  const contactActions = [
    {
      id: 'call',
      title: i18n.t('support.callSupport'),
      subtitle: '+1 (555) 123-4567',
      icon: 'phone',
      color: colors.success,
      action: () => Linking.openURL('tel:+15551234567')
    },
    {
      id: 'email',
      title: i18n.t('support.emailSupport'),
      subtitle: 'support@goodfood.com',
      icon: 'email',
      color: colors.primary,
      action: () => Linking.openURL('mailto:support@goodfood.com')
    },
    {
      id: 'chat',
      title: i18n.t('support.liveChat'),
      subtitle: i18n.t('support.workingHours'),
      icon: 'chat',
      color: colors.info,
      action: () => Alert.alert('Chat', 'Live chat feature coming soon!')
    }
  ];

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{i18n.t('support.title')}</Text>
        <Text style={styles.headerSubtitle}>{i18n.t('support.subtitle')}</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Section Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('support.contact')}</Text>
          <Text style={styles.sectionSubtitle}>{i18n.t('support.responseTime')}: &lt; 2h</Text>

          {contactActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              onPress={action.action}
              style={styles.contactCard}
            >
              <View style={[styles.contactIcon, { backgroundColor: action.color }]}>
                <Icon name={action.icon} type="material" size={24} color={colors.white} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>{action.title}</Text>
                <Text style={styles.contactSubtitle}>{action.subtitle}</Text>
              </View>
              <Icon name="chevron-right" type="material" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Section FAQ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('support.faq')}</Text>

          {faqData.map((faq) => (
            <Card key={faq.id} containerStyle={styles.faqCard}>
              <TouchableOpacity
                onPress={() => toggleFAQ(faq.id)}
                style={styles.faqHeader}
              >
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Icon
                  name={expandedFAQ === faq.id ? 'expand-less' : 'expand-more'}
                  type="material"
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>

              {expandedFAQ === faq.id && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </Card>
          ))}
        </View>

        {/* Section Rapport de Bug */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('support.bugReport')}</Text>

          <Card containerStyle={styles.bugReportCard}>
            <Text style={styles.bugReportTitle}>{i18n.t('support.describeIssue')}</Text>

            {/* Sélecteur de catégorie */}
            <View style={styles.selectorContainer}>
              <Text style={styles.selectorLabel}>{i18n.t('support.category')}</Text>
              <View style={styles.selectorButtons}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.key}
                    onPress={() => setBugReport(prev => ({ ...prev, category: category.key }))}
                    style={[
                      styles.selectorButton,
                      bugReport.category === category.key && styles.selectorButtonActive
                    ]}
                  >
                    <Text style={[
                      styles.selectorButtonText,
                      bugReport.category === category.key && styles.selectorButtonTextActive
                    ]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sélecteur de priorité */}
            <View style={styles.selectorContainer}>
              <Text style={styles.selectorLabel}>{i18n.t('support.priority')}</Text>
              <View style={styles.selectorButtons}>
                {priorities.map((priority) => (
                  <TouchableOpacity
                    key={priority.key}
                    onPress={() => setBugReport(prev => ({ ...prev, priority: priority.key }))}
                    style={[
                      styles.selectorButton,
                      styles.priorityButton,
                      bugReport.priority === priority.key && [
                        styles.selectorButtonActive,
                        { borderColor: priority.color }
                      ]
                    ]}
                  >
                    <Text style={[
                      styles.selectorButtonText,
                      bugReport.priority === priority.key && styles.selectorButtonTextActive
                    ]}>
                      {priority.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Zone de description */}
            <Input
              placeholder={i18n.t('support.issuePlaceholder')}
              multiline
              numberOfLines={4}
              value={bugReport.description}
              onChangeText={(text) => setBugReport(prev => ({ ...prev, description: text }))}
              containerStyle={styles.descriptionInput}
              inputContainerStyle={styles.descriptionInputContainer}
              inputStyle={styles.descriptionInputText}
            />

            <Button
              title={i18n.t('support.sendReport')}
              onPress={submitBugReport}
              buttonStyle={styles.submitButton}
              disabled={!bugReport.description.trim()}
            />
          </Card>
        </View>

        {/* Section Informations Système */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('support.systemInfo')}</Text>

          <Card containerStyle={styles.systemInfoCard}>
            <View style={styles.systemInfoRow}>
              <Text style={styles.systemInfoLabel}>{i18n.t('support.appVersion')}</Text>
              <Text style={styles.systemInfoValue}>{systemInfo.appVersion}</Text>
            </View>

            <View style={styles.systemInfoRow}>
              <Text style={styles.systemInfoLabel}>{i18n.t('support.deviceInfo')}</Text>
              <Text style={styles.systemInfoValue}>
                {systemInfo.platform} {systemInfo.osVersion}
              </Text>
            </View>

            <View style={styles.systemInfoRow}>
              <Text style={styles.systemInfoLabel}>Currency</Text>
              <Text style={styles.systemInfoValue}>
                {currency?.symbol || '€'} ({currency?.code || 'EUR'})
              </Text>
            </View>

            {isAuthenticated && driver && (
              <View style={styles.systemInfoRow}>
                <Text style={styles.systemInfoLabel}>Driver ID</Text>
                <Text style={styles.systemInfoValue}>{driver._id}</Text>
              </View>
            )}
          </Card>
        </View>

        {/* Espace en bas pour le scroll */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },

  // Header
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.8,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },

  // Sections
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
  },

  // Contact cards
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },

  // FAQ cards
  faqCard: {
    borderRadius: 12,
    padding: 0,
    marginBottom: 8,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
    marginRight: 16,
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.background.secondary,
  },

  // Bug report card
  bugReportCard: {
    borderRadius: 12,
    padding: 16,
  },
  bugReportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },

  // Selectors
  selectorContainer: {
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  selectorButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectorButton: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  priorityButton: {
    borderColor: colors.text.secondary,
  },
  selectorButtonActive: {
    backgroundColor: colors.primary,
  },
  selectorButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  selectorButtonTextActive: {
    color: colors.white,
  },

  // Description input
  descriptionInput: {
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  descriptionInputContainer: {
    borderWidth: 1,
    borderColor: colors.background.secondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 100,
  },
  descriptionInputText: {
    fontSize: 14,
    color: colors.text.primary,
    textAlignVertical: 'top',
  },

  // Submit button
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
  },

  // System info card
  systemInfoCard: {
    borderRadius: 12,
    padding: 16,
  },
  systemInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  systemInfoLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  systemInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },

  // Bottom spacer
  bottomSpacer: {
    height: 20,
  },
});
