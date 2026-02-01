import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { SettingRow } from './index';

const PrivacySettings = ({ localSettings, onSwitchChange, onFeatureComingSoon }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{i18n.t('settings.privacy')}</Text>

      <Card containerStyle={styles.card}>
        <SettingRow
          title={i18n.t('settings.locationServices')}
          subtitle="Allow access to location for delivery services"
          switchProps={{
            value: localSettings.locationServices,
            onValueChange: (value) => onSwitchChange('locationServices', value)
          }}
        />

        <SettingRow
          title={i18n.t('settings.backgroundLocation')}
          subtitle="Continue tracking location in background"
          switchProps={{
            value: localSettings.backgroundLocation,
            onValueChange: (value) => onSwitchChange('backgroundLocation', value),
            disabled: !localSettings.locationServices
          }}
        />

        <SettingRow
          title={i18n.t('settings.analytics')}
          subtitle="Help improve the app by sharing usage data"
          switchProps={{
            value: localSettings.analytics,
            onValueChange: (value) => onSwitchChange('analytics', value)
          }}
        />

        <View style={styles.divider} />

        <SettingRow
          title={i18n.t('settings.changePassword')}
          subtitle="Update your account password"
          showChevron={true}
          onPress={() => onFeatureComingSoon('Change password')}
        />

        <SettingRow
          title={i18n.t('settings.biometricAuth')}
          subtitle="Use fingerprint or face recognition to login"
          switchProps={{
            value: localSettings.biometricAuth,
            onValueChange: (value) => onSwitchChange('biometricAuth', value)
          }}
        />

        <SettingRow
          title={i18n.t('settings.twoFactorAuth')}
          subtitle="Add an extra layer of security to your account"
          switchProps={{
            value: localSettings.twoFactorAuth,
            onValueChange: (value) => onSwitchChange('twoFactorAuth', value)
          }}
        />
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
  divider: {
    height: 1,
    backgroundColor: colors.background.secondary,
    marginHorizontal: 16,
  },
});

export default PrivacySettings;
