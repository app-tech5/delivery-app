import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';
import { useSettingsManager } from '../hooks/useSettingsManager';
import GeneralSettings from '../components/GeneralSettings';
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{i18n.t('navigation.settings')}</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <GeneralSettings
          localSettings={localSettings}
          currency={currency}
          onThemeChange={handleThemeChange}
          onFeatureComingSoon={handleFeatureComingSoon}
        />

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
  },
  scrollView: {
    flex: 1,
  },
  bottomSpacer: {
    height: 20,
  },
});
