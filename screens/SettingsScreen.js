import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';
import { useSettingsScreen } from '../hooks/useSettingsScreen';
import { ScreenLayout } from '../components';
import GeneralSettings from '../components/GeneralSettings';
import PaymentSettings from '../components/PaymentSettings';
import NotificationSettings from '../components/NotificationSettings';
import PrivacySettings from '../components/PrivacySettings';
import DataSettings from '../components/DataSettings';
import AboutSection from '../components/AboutSection';
import SettingsActions from '../components/SettingsActions';

export default function SettingsScreen() {
  const { logout } = useDriver();
  const {
    currency,
    invalidateCache,
    getAvailableLanguages,
    getAvailableCurrencies,
    changeLanguage,
    changeCurrency,
    localeVersion,
  } = useSettings();

  const {
    localSettings,
    handleSwitchChange,
    handleThemeChange,
    handleSave,
    handleReset,
    handleClearCache,
    handleClearData,
    openURL,
    handleFeatureComingSoon,
  } = useSettingsScreen(invalidateCache, logout);

  return (
    <ScreenLayout title={i18n.t('navigation.settings')} key={`settings-${localeVersion}`}>
      <ScrollView style={styles.scrollView}>
        <GeneralSettings
          localSettings={localSettings}
          currency={currency}
          onThemeChange={handleThemeChange}
          onLanguageChange={changeLanguage}
          onCurrencyChange={changeCurrency}
          getAvailableLanguages={getAvailableLanguages}
          getAvailableCurrencies={getAvailableCurrencies}
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
