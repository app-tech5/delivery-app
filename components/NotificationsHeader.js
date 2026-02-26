import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Badge } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';

const NotificationsHeader = ({ unreadCount, onMarkAllAsRead }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>{i18n.t('notifications.title')}</Text>
        {unreadCount > 0 && (
          <Badge
            value={unreadCount}
            status="error"
            containerStyle={styles.badgeContainer}
          />
        )}
      </View>
      {unreadCount > 0 && (
        <TouchableOpacity onPress={onMarkAllAsRead} style={styles.markAllButton}>
          <Text style={styles.markAllText}>{i18n.t('notifications.markAllAsRead')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginRight: 12,
  },
  badgeContainer: {
    marginTop: -8,
  },
  markAllButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  markAllText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default NotificationsHeader;


