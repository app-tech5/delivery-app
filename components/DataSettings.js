import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card, Icon } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';

const DataSettings = ({ onClearCache, onClearData }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Data & Storage</Text>

      <Card containerStyle={styles.card}>
        <TouchableOpacity style={styles.settingRow} onPress={onClearCache}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>{i18n.t('settings.clearCache')}</Text>
            <Text style={styles.settingSubtitle}>Free up storage space</Text>
          </View>
          <Icon name="chevron-right" type="material" size={24} color={colors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={onClearData}>
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

export default DataSettings;
