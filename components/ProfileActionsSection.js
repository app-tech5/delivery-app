import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import { Card } from 'react-native-elements';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../global';
import i18n from '../i18n';

export function ProfileEditButton({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.editButton}>
      <MaterialIcons name="edit" size={20} color={colors.white} />
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
      <Card containerStyle={styles.card}>
        <Pressable
          style={({ pressed }) => [styles.actionRow, pressed && styles.actionPressed]}
          accessibilityRole="button"
        >
          <View style={[styles.iconWrap, styles.primaryIconWrap]}>
            <MaterialIcons name="lock-outline" size={20} color={colors.primary} />
          </View>
          <Text style={styles.actionLabel}>{i18n.t('profile.changePassword')}</Text>
          <MaterialIcons name="chevron-right" size={22} color={colors.text.secondary} />
        </Pressable>

        <View style={styles.divider} />

        <Pressable
          style={({ pressed }) => [styles.actionRow, pressed && styles.actionPressed]}
          onPress={onLogout}
          accessibilityRole="button"
        >
          <View style={[styles.iconWrap, styles.logoutIconWrap]}>
            <MaterialIcons name="logout" size={20} color={colors.error} />
          </View>
          <Text style={[styles.actionLabel, styles.logoutLabel]}>{i18n.t('navigation.logout')}</Text>
        </Pressable>
      </Card>
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
            Alert.alert(i18n.t('common.error'), 'Failed to logout');
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
    paddingTop: 0,
  },
  card: {
    borderRadius: 12,
    padding: 0,
    margin: 0,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 56,
  },
  actionPressed: {
    backgroundColor: colors.background.secondary,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  primaryIconWrap: {
    backgroundColor: `${colors.primary}15`,
  },
  logoutIconWrap: {
    backgroundColor: `${colors.error}15`,
  },
  actionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  logoutLabel: {
    color: colors.error,
  },
  divider: {
    height: 1,
    backgroundColor: colors.background.secondary,
    marginHorizontal: 16,
  },
});
