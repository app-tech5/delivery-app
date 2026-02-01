import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';

const SystemInfo = ({ systemInfo, currency, driver, isAuthenticated }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{i18n.t('support.systemInfo')}</Text>

      <Card containerStyle={styles.systemInfoCard}>
        <View style={styles.systemInfoRow}>
          <Text style={styles.systemInfoLabel}>{i18n.t('support.appVersion')}</Text>
          <Text style={styles.systemInfoValue}>{systemInfo.appVersion}</Text>
        </View>

        <View style={styles.systemInfoRow}>
          <Text style={styles.systemInfoLabel}>{i18n.t('support.deviceInfo')}</Text>
          <Text style={styles.systemInfoValue}>
            {systemInfo.platform} {systemInfo.osVersion}
          </Text>
        </View>

        <View style={styles.systemInfoRow}>
          <Text style={styles.systemInfoLabel}>Currency</Text>
          <Text style={styles.systemInfoValue}>
            {currency?.symbol || '€'} ({currency?.code || 'EUR'})
          </Text>
        </View>

        {isAuthenticated && driver && (
          <View style={styles.systemInfoRow}>
            <Text style={styles.systemInfoLabel}>Driver ID</Text>
            <Text style={styles.systemInfoValue}>{driver._id}</Text>
          </View>
        )}
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
    marginBottom: 8,
  },
  systemInfoCard: {
    borderRadius: 12,
    padding: 16,
  },
  systemInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  systemInfoLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  systemInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
});

export default SystemInfo;
