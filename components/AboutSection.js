import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card, Icon } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { APP_INFO, EXTERNAL_LINKS } from '../utils/settingsData';

const AboutSection = ({ onOpenURL }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{i18n.t('settings.about')}</Text>

      <Card containerStyle={styles.card}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>{i18n.t('settings.version')}</Text>
            <Text style={styles.settingSubtitle}>{APP_INFO.version} ({APP_INFO.build})</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => onOpenURL(EXTERNAL_LINKS.terms)}
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>{i18n.t('settings.termsOfService')}</Text>
            <Text style={styles.settingSubtitle}>Read our terms and conditions</Text>
          </View>
          <Icon name="open-in-new" type="material" size={20} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => onOpenURL(EXTERNAL_LINKS.privacy)}
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>{i18n.t('settings.privacyPolicy')}</Text>
            <Text style={styles.settingSubtitle}>Learn how we protect your data</Text>
          </View>
          <Icon name="open-in-new" type="material" size={20} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => onOpenURL(EXTERNAL_LINKS.support)}
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>{i18n.t('settings.support')}</Text>
            <Text style={styles.settingSubtitle}>Get help and contact support</Text>
          </View>
          <Icon name="help" type="material" size={20} color={colors.primary} />
        </TouchableOpacity>
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
});

export default AboutSection;
