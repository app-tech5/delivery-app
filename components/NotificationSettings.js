import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { SettingRow } from './index';

const NotificationSettings = ({ localSettings, onSwitchChange }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{i18n.t('settings.notifications')}</Text>

      <Card containerStyle={styles.card}>
        <SettingRow
          title={i18n.t('settings.orderAlerts')}
          subtitle="Get notified when new orders are available"
          switchProps={{
            value: localSettings.orderAlerts,
            onValueChange: (value) => onSwitchChange('orderAlerts', value)
          }}
        />

        <SettingRow
          title={i18n.t('settings.paymentAlerts')}
          subtitle="Receive payment confirmations and updates"
          switchProps={{
            value: localSettings.paymentAlerts,
            onValueChange: (value) => onSwitchChange('paymentAlerts', value)
          }}
        />

        <SettingRow
          title={i18n.t('settings.systemUpdates')}
          subtitle="Important app updates and maintenance notices"
          switchProps={{
            value: localSettings.systemUpdates,
            onValueChange: (value) => onSwitchChange('systemUpdates', value)
          }}
        />

        <SettingRow
          title={i18n.t('settings.marketing')}
          subtitle="Promotional offers and marketing communications"
          switchProps={{
            value: localSettings.marketing,
            onValueChange: (value) => onSwitchChange('marketing', value)
          }}
        />

        <View style={styles.divider} />

        <SettingRow
          title={i18n.t('settings.sound')}
          subtitle="Play notification sounds"
          switchProps={{
            value: localSettings.sound,
            onValueChange: (value) => onSwitchChange('sound', value)
          }}
        />

        <SettingRow
          title={i18n.t('settings.vibration')}
          subtitle="Vibrate on notifications"
          switchProps={{
            value: localSettings.vibration,
            onValueChange: (value) => onSwitchChange('vibration', value)
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

export default NotificationSettings;
