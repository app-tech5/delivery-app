import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';
import { useSupport } from '../hooks/useSupport';
import ContactActions from '../components/ContactActions';
import FAQSection from '../components/FAQSection';
import BugReportForm from '../components/BugReportForm';
import SystemInfo from '../components/SystemInfo';

export default function SupportScreen() {
  const { isAuthenticated, driver } = useDriver();
  const { currency } = useSettings();

  const {
    expandedFAQ,
    bugReport,
    setBugReport,
    systemInfo,
    toggleFAQ,
    submitBugReport,
    handleContactAction
  } = useSupport(currency, driver);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{i18n.t('support.title')}</Text>
        <Text style={styles.headerSubtitle}>{i18n.t('support.subtitle')}</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <ContactActions onContactAction={handleContactAction} />

        <FAQSection
          expandedFAQ={expandedFAQ}
          onToggleFAQ={toggleFAQ}
        />

        <BugReportForm
          bugReport={bugReport}
          setBugReport={setBugReport}
          onSubmit={submitBugReport}
        />

        <SystemInfo
          systemInfo={systemInfo}
          currency={currency}
          driver={driver}
          isAuthenticated={isAuthenticated}
        />

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
  scrollView: {
    flex: 1,
  },
  bottomSpacer: {
    height: 20,
  },
});
