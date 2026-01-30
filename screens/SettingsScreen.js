import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  Dimensions
} from 'react-native';
import { Card, Icon, Button } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';

const { width } = Dimensions.get('window');

export default function SettingsScreen() {
  const { isAuthenticated, logout } = useDriver();
  const { settings, currency, language, refreshSettings, invalidateCache } = useSettings();

  // État local pour les paramètres
  const [localSettings, setLocalSettings] = useState({
    // Notifications
    orderAlerts: true,
    paymentAlerts: true,
    systemUpdates: true,
    marketing: false,

    // Apparence
    theme: 'auto', // 'light', 'dark', 'auto'

    // Localisation
    sound: true,
    vibration: true,

    // Services
    locationServices: true,
    backgroundLocation: false,
    analytics: true,

    // Sécurité
    biometricAuth: false,
    twoFactorAuth: false
  });

  // Options disponibles
  const themeOptions = [
    { key: 'light', label: i18n.t('settings.lightMode'), icon: 'wb-sunny' },
    { key: 'dark', label: i18n.t('settings.darkMode'), icon: 'nightlight' },
    { key: 'auto', label: i18n.t('settings.autoMode'), icon: 'brightness-auto' }
  ];

  const languageOptions = [
    { key: 'en', label: 'English', flag: '🇺🇸' },
    { key: 'fr', label: 'Français', flag: '🇫🇷' },
    { key: 'es', label: 'Español', flag: '🇪🇸' },
    { key: 'de', label: 'Deutsch', flag: '🇩🇪' }
  ];

  const currencyOptions = [
    { key: 'EUR', label: 'Euro (€)', symbol: '€' },
    { key: 'USD', label: 'US Dollar ($)', symbol: '$' },
    { key: 'GBP', label: 'British Pound (£)', symbol: '£' },
    { key: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' }
  ];

  // Gestionnaire de changement de switch
  const handleSwitchChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Gestionnaire de changement de thème
  const handleThemeChange = (theme) => {
    setLocalSettings(prev => ({
      ...prev,
      theme
    }));
  };

  // Gestionnaire de sauvegarde
  const handleSave = () => {
    // Simulation de sauvegarde
    Alert.alert('Success', i18n.t('settings.settingsSaved'));
  };

  // Gestionnaire de reset
  const handleReset = () => {
    Alert.alert(
      'Reset Settings',
      i18n.t('settings.confirmReset'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setLocalSettings({
              orderAlerts: true,
              paymentAlerts: true,
              systemUpdates: true,
              marketing: false,
              theme: 'auto',
              sound: true,
              vibration: true,
              locationServices: true,
              backgroundLocation: false,
              analytics: true,
              biometricAuth: false,
              twoFactorAuth: false
            });
            Alert.alert('Success', 'Settings reset to default');
          }
        }
      ]
    );
  };

  // Gestionnaire de clear cache
  const handleClearCache = async () => {
    try {
      await invalidateCache();
      Alert.alert('Success', i18n.t('settings.cacheCleared'));
    } catch (error) {
      Alert.alert('Error', 'Failed to clear cache');
    }
  };

  // Gestionnaire de clear data
  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      i18n.t('settings.confirmDataClear'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              Alert.alert('Success', i18n.t('settings.dataCleared'));
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          }
        }
      ]
    );
  };

  // Gestionnaire d'ouverture d'URL
  const openURL = (url) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open link');
    });
  };

  // Rendu d'un élément de setting avec switch
  const renderSwitchSetting = (title, subtitle, key, disabled = false) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={localSettings[key]}
        onValueChange={(value) => handleSwitchChange(key, value)}
        trackColor={{ false: colors.background.secondary, true: colors.primary }}
        thumbColor={localSettings[key] ? colors.white : colors.text.secondary}
        disabled={disabled}
      />
    </View>
  );

  // Rendu d'un élément de setting avec sélection
  const renderSelectSetting = (title, subtitle, options, selectedValue, onSelect) => (
    <TouchableOpacity style={styles.settingRow} onPress={() => {
      // Pour la démo, on simule une sélection
      Alert.alert('Feature', 'Selection dialog coming soon');
    }}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        <Text style={styles.settingValue}>
          {options.find(opt => opt.key === selectedValue)?.label || selectedValue}
        </Text>
      </View>
      <Icon name="chevron-right" type="material" size={24} color={colors.text.secondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{i18n.t('navigation.settings')}</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Section Général */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('settings.general')}</Text>

          <Card containerStyle={styles.card}>
            {renderSelectSetting(
              i18n.t('settings.language'),
              i18n.t('settings.currentLanguage'),
              languageOptions,
              'en',
              () => {}
            )}

            {renderSelectSetting(
              i18n.t('settings.currency'),
              `${currency?.symbol || '€'} (${currency?.code || 'EUR'})`,
              currencyOptions,
              currency?.code || 'EUR',
              () => {}
            )}

            <View style={styles.themeSelector}>
              <Text style={styles.settingTitle}>{i18n.t('settings.theme')}</Text>
              <View style={styles.themeOptions}>
                {themeOptions.map((theme) => (
                  <TouchableOpacity
                    key={theme.key}
                    onPress={() => handleThemeChange(theme.key)}
                    style={[
                      styles.themeOption,
                      localSettings.theme === theme.key && styles.themeOptionSelected
                    ]}
                  >
                    <Icon
                      name={theme.icon}
                      type="material"
                      size={20}
                      color={localSettings.theme === theme.key ? colors.white : colors.primary}
                    />
                    <Text style={[
                      styles.themeOptionText,
                      localSettings.theme === theme.key && styles.themeOptionTextSelected
                    ]}>
                      {theme.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>
        </View>

        {/* Section Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('settings.notifications')}</Text>

          <Card containerStyle={styles.card}>
            {renderSwitchSetting(
              i18n.t('settings.orderAlerts'),
              'Get notified when new orders are available',
              'orderAlerts'
            )}

            {renderSwitchSetting(
              i18n.t('settings.paymentAlerts'),
              'Receive payment confirmations and updates',
              'paymentAlerts'
            )}

            {renderSwitchSetting(
              i18n.t('settings.systemUpdates'),
              'Important app updates and maintenance notices',
              'systemUpdates'
            )}

            {renderSwitchSetting(
              i18n.t('settings.marketing'),
              'Promotional offers and marketing communications',
              'marketing'
            )}

            <View style={styles.divider} />

            {renderSwitchSetting(
              i18n.t('settings.sound'),
              'Play notification sounds',
              'sound'
            )}

            {renderSwitchSetting(
              i18n.t('settings.vibration'),
              'Vibrate on notifications',
              'vibration'
            )}
          </Card>
        </View>

        {/* Section Confidentialité & Sécurité */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('settings.privacy')}</Text>

          <Card containerStyle={styles.card}>
            {renderSwitchSetting(
              i18n.t('settings.locationServices'),
              'Allow access to location for delivery services',
              'locationServices'
            )}

            {renderSwitchSetting(
              i18n.t('settings.backgroundLocation'),
              'Continue tracking location in background',
              'backgroundLocation',
              !localSettings.locationServices
            )}

            {renderSwitchSetting(
              i18n.t('settings.analytics'),
              'Help improve the app by sharing usage data',
              'analytics'
            )}

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{i18n.t('settings.changePassword')}</Text>
                <Text style={styles.settingSubtitle}>Update your account password</Text>
              </View>
              <Icon name="chevron-right" type="material" size={24} color={colors.text.secondary} />
            </TouchableOpacity>

            {renderSwitchSetting(
              i18n.t('settings.biometricAuth'),
              'Use fingerprint or face recognition to login',
              'biometricAuth'
            )}

            {renderSwitchSetting(
              i18n.t('settings.twoFactorAuth'),
              'Add an extra layer of security to your account',
              'twoFactorAuth'
            )}
          </Card>
        </View>

        {/* Section Données */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Storage</Text>

          <Card containerStyle={styles.card}>
            <TouchableOpacity style={styles.settingRow} onPress={handleClearCache}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{i18n.t('settings.clearCache')}</Text>
                <Text style={styles.settingSubtitle}>Free up storage space</Text>
              </View>
              <Icon name="chevron-right" type="material" size={24} color={colors.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={handleClearData}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.error }]}>
                  {i18n.t('settings.clearData')}
                </Text>
                <Text style={styles.settingSubtitle}>Delete all app data and logout</Text>
              </View>
              <Icon name="chevron-right" type="material" size={24} color={colors.error} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Section À propos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{i18n.t('settings.about')}</Text>

          <Card containerStyle={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{i18n.t('settings.version')}</Text>
                <Text style={styles.settingSubtitle}>1.0.0 (Build 123)</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => openURL('https://goodfood.com/terms')}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{i18n.t('settings.termsOfService')}</Text>
                <Text style={styles.settingSubtitle}>Read our terms and conditions</Text>
              </View>
              <Icon name="open-in-new" type="material" size={20} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => openURL('https://goodfood.com/privacy')}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{i18n.t('settings.privacyPolicy')}</Text>
                <Text style={styles.settingSubtitle}>Learn how we protect your data</Text>
              </View>
              <Icon name="open-in-new" type="material" size={20} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => openURL('https://goodfood.com/support')}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{i18n.t('settings.support')}</Text>
                <Text style={styles.settingSubtitle}>Get help and contact support</Text>
              </View>
              <Icon name="help" type="material" size={20} color={colors.primary} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <View style={styles.buttonRow}>
            <Button
              title={i18n.t('settings.reset')}
              buttonStyle={styles.resetButton}
              titleStyle={styles.resetButtonText}
              onPress={handleReset}
            />
            <Button
              title={i18n.t('settings.save')}
              buttonStyle={styles.saveButton}
              onPress={handleSave}
            />
          </View>
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
    marginBottom: 12,
  },

  // Cards
  card: {
    borderRadius: 12,
    padding: 0,
  },

  // Setting rows
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  settingValue: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 4,
  },

  // Theme selector
  themeSelector: {
    padding: 16,
  },
  themeOptions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.background.secondary,
  },
  themeOptionSelected: {
    backgroundColor: colors.primary,
  },
  themeOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
    marginTop: 4,
  },
  themeOptionTextSelected: {
    color: colors.white,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.background.secondary,
    marginHorizontal: 16,
  },

  // Actions section
  actionsSection: {
    padding: 16,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  resetButton: {
    backgroundColor: colors.text.secondary,
    marginRight: 8,
    flex: 1,
  },
  resetButtonText: {
    color: colors.white,
  },
  saveButton: {
    backgroundColor: colors.primary,
    flex: 1,
  },

  // Bottom spacer
  bottomSpacer: {
    height: 20,
  },
});
