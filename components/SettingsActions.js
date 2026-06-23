import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../global';
import i18n from '../i18n';

const SettingsActions = ({ onSave, onReset }) => {
  return (
    <View style={styles.actionsSection}>
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={onReset}
          activeOpacity={0.85}
        >
          <MaterialIcons name="restart-alt" size={20} color={colors.text.primary} />
          <Text style={styles.resetButtonText}>{i18n.t('settings.reset')}</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={onSave}
          activeOpacity={0.85}
        >
          <MaterialIcons name="check" size={20} color={colors.white} />
          <Text style={styles.saveButtonText}>{i18n.t('settings.save')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionsSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: colors.background.secondary,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  divider: {
    width: 1,
    backgroundColor: colors.border.light,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});

export default SettingsActions;
