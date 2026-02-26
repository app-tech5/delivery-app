import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';

const SettingsActions = ({ onSave, onReset }) => {
  return (
    <View style={styles.actionsSection}>
      <View style={styles.buttonRow}>
        <Button
          title={i18n.t('settings.reset')}
          buttonStyle={styles.resetButton}
          titleStyle={styles.resetButtonText}
          onPress={onReset}
        />
        <Button
          title={i18n.t('settings.save')}
          buttonStyle={styles.saveButton}
          onPress={onSave}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default SettingsActions;


