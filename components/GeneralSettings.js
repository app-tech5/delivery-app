import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card, Icon } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { SettingRow } from './index';
import { THEME_OPTIONS } from '../utils/settingsData';

const GeneralSettings = ({ localSettings, currency, onThemeChange, onFeatureComingSoon }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{i18n.t('settings.general')}</Text>

      <Card containerStyle={styles.card}>
        <SettingRow
          title={i18n.t('settings.language')}
          subtitle={i18n.t('settings.currentLanguage')}
          value="English"
          showChevron={true}
          onPress={() => onFeatureComingSoon('Language selection')}
        />

        <SettingRow
          title={i18n.t('settings.currency')}
          subtitle="Display currency for prices"
          value={`${currency?.symbol || '€'} (${currency?.code || 'EUR'})`}
          showChevron={true}
          onPress={() => onFeatureComingSoon('Currency selection')}
        />

        <View style={styles.themeSelector}>
          <Text style={styles.settingTitle}>{i18n.t('settings.theme')}</Text>
          <View style={styles.themeOptions}>
            {THEME_OPTIONS.map((theme) => (
              <TouchableOpacity
                key={theme.key}
                onPress={() => onThemeChange(theme.key)}
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
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 0,
  },
  themeSelector: {
    padding: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
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
});

export default GeneralSettings;
