import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card, Icon, Button } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { getNotificationColor, getNotificationIcon } from '../utils/formatters';
import { formatTimeAgo } from '../utils/dateUtils';

export default function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete
}) {

  return (
    <Card containerStyle={[
      styles.card,
      !notification.read && styles.unreadCard
    ]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon
            name={getNotificationIcon(notification.type)}
            type="material"
            size={20}
            color={getNotificationColor(notification.type)}
          />
        </View>

        <View style={styles.content}>
          <Text style={[
            styles.title,
            !notification.read && styles.unreadTitle
          ]}>
            {notification.title}
          </Text>
          <Text style={styles.time}>
            {formatTimeAgo(notification.timestamp)}
          </Text>
        </View>

        {!notification.read && <View style={styles.unreadIndicator} />}
      </View>

      <Text style={styles.message}>
        {notification.message}
      </Text>

      <View style={styles.actions}>
        {!notification.read && (
          <Button
            title={i18n.t('notifications.markAsRead')}
            onPress={() => onMarkAsRead(notification.id)}
            buttonStyle={styles.markReadButton}
            titleStyle={styles.markReadButtonText}
          />
        )}
        <Button
          title={i18n.t('notifications.delete')}
          onPress={() => onDelete(notification.id)}
          buttonStyle={styles.deleteButton}
          titleStyle={styles.deleteButtonText}
          icon={
            <Icon
              name="delete"
              type="material"
              size={16}
              color={colors.error}
              style={{ marginRight: 4 }}
            />
          }
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    backgroundColor: 'rgba(0, 123, 255, 0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  unreadTitle: {
    color: colors.primary,
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  message: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  markReadButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
    marginRight: 8,
  },
  markReadButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.error,
  },
});
