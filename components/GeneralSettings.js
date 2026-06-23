import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Card, Icon } from 'react-native-elements';
import { colors } from '../global';
import i18n, { getCurrentLanguage } from '../i18n';
import { SettingRow } from './index';
import { THEME_OPTIONS, LANGUAGE_OPTIONS } from '../utils/settingsData';
import SettingsPickerModal from './SettingsPickerModal';

const GeneralSettings = ({
  localSettings = {},
  currency,
  onThemeChange,
  onLanguageChange,
  onCurrencyChange,
  getAvailableLanguages,
  getAvailableCurrencies,
}) => {
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [languageItems, setLanguageItems] = useState([]);
  const [currencyItems, setCurrencyItems] = useState([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(false);

  const currentLanguageCode = getCurrentLanguage();
  const currentLanguageLabel =
    LANGUAGE_OPTIONS.find((lang) => lang.key === currentLanguageCode)?.label
    || currentLanguageCode.toUpperCase();

  const openLanguagePicker = useCallback(() => {
    const languages = typeof getAvailableLanguages === 'function'
      ? getAvailableLanguages()
      : [];
    setLanguageItems(
      languages.map((lang) => ({
        id: lang.key,
        label: lang.label,
        leading: lang.flag,
      }))
    );
    setLanguageModalVisible(true);
  }, [getAvailableLanguages]);

  const openCurrencyPicker = useCallback(async () => {
    setCurrencyModalVisible(true);
    setLoadingCurrencies(true);
    try {
      const currencies = typeof getAvailableCurrencies === 'function'
        ? await getAvailableCurrencies()
        : [];
      setCurrencyItems(
        currencies.map((item) => ({
          id: item._id || item.id || item.code,
          raw: item,
          label: `${item.symbol || ''} ${item.name || item.label || item.code}`.trim(),
          subtitle: item.code,
        }))
      );
    } catch (error) {
      console.error('Currency picker error:', error);
      Alert.alert(i18n.t('common.error'), i18n.t('settings.currencyLoadError'));
      setCurrencyModalVisible(false);
    } finally {
      setLoadingCurrencies(false);
    }
  }, [getAvailableCurrencies]);

  const handleLanguageSelect = async (item) => {
    setLanguageModalVisible(false);
    try {
      await onLanguageChange?.(item.id);
      Alert.alert(i18n.t('common.success'), i18n.t('settings.languageChanged'));
    } catch (error) {
      Alert.alert(i18n.t('common.error'), i18n.t('settings.languageSaveError'));
    }
  };

  const handleCurrencySelect = async (item) => {
    setCurrencyModalVisible(false);
    try {
      await onCurrencyChange?.(item.raw || item);
      Alert.alert(i18n.t('common.success'), i18n.t('settings.currencyChanged'));
    } catch (error) {
      Alert.alert(i18n.t('common.error'), i18n.t('settings.currencySaveError'));
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{i18n.t('settings.general')}</Text>

      <Card containerStyle={styles.card}>
        <SettingRow
          title={i18n.t('settings.language')}
          subtitle={i18n.t('settings.currentLanguageLabel')}
          value={currentLanguageLabel}
          showChevron
          onPress={openLanguagePicker}
        />

        <SettingRow
          title={i18n.t('settings.currency')}
          subtitle={i18n.t('settings.currencySubtitle')}
          value={`${currency?.symbol || '€'} (${currency?.code || 'EUR'})`}
          showChevron
          onPress={openCurrencyPicker}
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
                  localSettings.theme === theme.key && styles.themeOptionSelected,
                ]}
              >
                <Icon
                  name={theme.icon}
                  type="material"
                  size={20}
                  color={localSettings.theme === theme.key ? colors.white : colors.primary}
                />
                <Text
                  style={[
                    styles.themeOptionText,
                    localSettings.theme === theme.key && styles.themeOptionTextSelected,
                  ]}
                >
                  {theme.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Card>

      <SettingsPickerModal
        visible={languageModalVisible}
        title={i18n.t('settings.selectLanguage')}
        items={languageItems}
        selectedId={currentLanguageCode}
        onSelect={handleLanguageSelect}
        onClose={() => setLanguageModalVisible(false)}
      />

      <SettingsPickerModal
        visible={currencyModalVisible}
        title={i18n.t('settings.selectCurrency')}
        items={currencyItems}
        selectedId={currency?._id || currency?.id || currency?.code}
        loading={loadingCurrencies}
        onSelect={handleCurrencySelect}
        onClose={() => setCurrencyModalVisible(false)}
      />
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
