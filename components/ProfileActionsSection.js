import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';

export function ProfileEditButton({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.editButton}>
      <Icon name="edit" type="material" size={20} color={colors.white} />
    </TouchableOpacity>
  );
}

export function ProfileCancelButton({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.headerAction}>
      <Text style={styles.headerActionText}>{i18n.t('common.cancel')}</Text>
    </TouchableOpacity>
  );
}

export function ProfileSaveButton({ onPress, saving }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={saving} style={styles.headerAction}>
      {saving ? (
        <ActivityIndicator size="small" color={colors.white} />
      ) : (
        <Text style={styles.headerActionText}>{i18n.t('common.save')}</Text>
      )}
    </TouchableOpacity>
  );
}

export default function ProfileActionsSection({ onLogout }) {
  return (
    <View style={styles.section}>
      <Button
        title={i18n.t('profile.changePassword')}
        buttonStyle={styles.secondaryButton}
        titleStyle={styles.secondaryButtonText}
        icon={
          <Icon
            name="lock"
            type="material"
            size={16}
            color={colors.primary}
            style={{ marginRight: 8 }}
          />
        }
      />

      <Button
        title={i18n.t('navigation.logout')}
        buttonStyle={styles.logoutButton}
        titleStyle={styles.logoutButtonText}
        onPress={onLogout}
        icon={
          <Icon
            name="logout"
            type="material"
            size={16}
            color={colors.error}
            style={{ marginRight: 8 }}
          />
        }
      />
    </View>
  );
}

export function confirmLogout(onLogout) {
  Alert.alert(
    i18n.t('navigation.logout'),
    i18n.t('common.confirmLogout'),
    [
      { text: i18n.t('common.cancel'), style: 'cancel' },
      {
        text: i18n.t('navigation.logout'),
        style: 'destructive',
        onPress: async () => {
          try {
            await onLogout();
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to logout');
          }
        },
      },
    ]
  );
}

const styles = StyleSheet.create({
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  headerAction: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  headerActionText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: colors.primary,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutButtonText: {
    color: colors.error,
  },
});
