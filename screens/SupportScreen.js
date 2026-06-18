import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';
import { useSupport } from '../hooks/useSupport';
import { ScreenLayout } from '../components';
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
    <ScreenLayout
      title={i18n.t('support.title')}
      subtitle={i18n.t('support.subtitle')}
    >
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
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  bottomSpacer: {
    height: 20,
  },
});
