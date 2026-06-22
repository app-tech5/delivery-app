import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text } from 'react-native';
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
    systemInfo,
    contactActions,
    faqs,
    loading,
    submitting,
    formResetKey,
    error,
    toggleFAQ,
    submitBugReport,
    handleContactAction,
    reloadSupportInfo,
  } = useSupport(currency, driver);

  return (
    <ScreenLayout
      title={i18n.t('support.title')}
      subtitle={i18n.t('support.subtitle')}
    >
      <ScrollView
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        nestedScrollEnabled
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={reloadSupportInfo}
            colors={[colors.primary]}
          />
        }
      >
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <ContactActions
          contactActions={contactActions}
          loading={loading}
          onContactAction={handleContactAction}
        />

        <FAQSection
          faqs={faqs}
          expandedFAQ={expandedFAQ}
          loading={loading}
          onToggleFAQ={toggleFAQ}
        />

        <BugReportForm
          onSubmit={submitBugReport}
          submitting={submitting}
          resetKey={formResetKey}
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
  errorBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  bottomSpacer: {
    height: 20,
  },
});
