import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Icon, Badge } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';
import { useNotifications } from '../hooks/useNotifications';
import NotificationsHeader from '../components/NotificationsHeader';
import NotificationItem from '../components/NotificationItem';
import EmptyState from '../components/EmptyState';

export default function NotificationsScreen() {
  const { deliveries, isAuthenticated, driver } = useDriver();

  const {
    filteredNotifications,
    activeFilter,
    setActiveFilter,
    refreshing,
    unreadCount,
    filters,
    onRefresh,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications(deliveries, driver);

  // Vérifier l'authentification
  if (!isAuthenticated || !driver) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.title}>{i18n.t('home.reconnect')}</Text>
          <Text style={styles.subtitle}>Please reconnect to view notifications</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Fonction pour obtenir le titre et sous-titre de l'état vide
  const getEmptyStateContent = () => {
    if (activeFilter === 'all') {
      return {
        title: i18n.t('notifications.noNotifications'),
        subtitle: "You're all caught up!"
      };
    }
    return {
      title: `No ${activeFilter} notifications`,
      subtitle: 'No notifications in this category yet.'
    };
  };

  const emptyStateContent = getEmptyStateContent();

  return (
    <SafeAreaView style={styles.container}>
      <NotificationsHeader
        unreadCount={unreadCount}
        onMarkAllAsRead={markAllAsRead}
      />

      {/* Filtres */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => setActiveFilter(filter.key)}
              style={[
                styles.filterButton,
                activeFilter === filter.key && styles.filterButtonActive
              ]}
            >
              <Icon
                name={filter.icon}
                type="material"
                size={18}
                color={activeFilter === filter.key ? colors.white : colors.primary}
              />
              <Text style={[
                styles.filterText,
                activeFilter === filter.key && styles.filterTextActive
              ]}>
                {filter.label}
              </Text>
              {filter.key === 'unread' && unreadCount > 0 && (
                <Badge
                  value={unreadCount}
                  status="error"
                  containerStyle={styles.filterBadge}
                  textStyle={styles.filterBadgeText}
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {filteredNotifications.length === 0 ? (
          <EmptyState
            icon="notifications-none"
            title={emptyStateContent.title}
            subtitle={emptyStateContent.subtitle}
          />
        ) : (
          <View style={styles.notificationsList}>
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  notificationsList: {
    padding: 16,
  },
  bottomSpacer: {
    height: 20,
  },

  // Filters
  filtersContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  filtersScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: 6,
    marginRight: 4,
  },
  filterTextActive: {
    color: colors.white,
  },
  filterBadge: {
    marginTop: -8,
    marginLeft: 4,
  },
  filterBadgeText: {
    fontSize: 10,
  },
});
