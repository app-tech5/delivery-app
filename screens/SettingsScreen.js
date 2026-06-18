import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';
import { useSettingsManager } from '../hooks/useSettingsManager';
import { ScreenLayout } from '../components';
import GeneralSettings from '../components/GeneralSettings';
import PaymentSettings from '../components/PaymentSettings';
import NotificationSettings from '../components/NotificationSettings';
import PrivacySettings from '../components/PrivacySettings';
import DataSettings from '../components/DataSettings';
import AboutSection from '../components/AboutSection';
import SettingsActions from '../components/SettingsActions';

export default function SettingsScreen() {
  const { isAuthenticated, logout } = useDriver();
  const { settings, currency, language, refreshSettings, invalidateCache } = useSettings();

  const {
    localSettings,
    handleSwitchChange,
    handleThemeChange,
    handleSave,
    handleReset,
    handleClearCache,
    handleClearData,
    openURL,
    handleFeatureComingSoon
  } = useSettingsManager(invalidateCache, logout);

  return (
    <ScreenLayout title={i18n.t('navigation.settings')}>
      <ScrollView style={styles.scrollView}>
        <GeneralSettings
          localSettings={localSettings}
          currency={currency}
          onThemeChange={handleThemeChange}
          onFeatureComingSoon={handleFeatureComingSoon}
        />

        <PaymentSettings />

        <NotificationSettings
          localSettings={localSettings}
          onSwitchChange={handleSwitchChange}
        />

        <PrivacySettings
          localSettings={localSettings}
          onSwitchChange={handleSwitchChange}
          onFeatureComingSoon={handleFeatureComingSoon}
        />

        <DataSettings
          onClearCache={handleClearCache}
          onClearData={handleClearData}
        />

        <AboutSection
          onOpenURL={openURL}
        />

        <SettingsActions
          onSave={handleSave}
          onReset={handleReset}
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
