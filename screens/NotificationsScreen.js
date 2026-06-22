import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Text, ScrollView } from 'react-native';
import { Icon, Badge } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';
import { useNotifications } from '../hooks/useNotifications';
import { ScreenLayout, AuthGuard } from '../components';
import NotificationItem from '../components/NotificationItem';
import EmptyState from '../components/EmptyState';

export default function NotificationsScreen() {
  const {
    isAuthenticated,
    driver,
    hasCompletedOnboarding,
  } = useDriver();

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
  } = useNotifications(isAuthenticated, driver);

  const emptyStateContent = useMemo(() => {
    if (activeFilter === 'all') {
      return {
        title: i18n.t('notifications.noNotifications'),
        subtitle: i18n.t('notifications.allCaughtUp'),
      };
    }

    const filterLabel = filters.find((filter) => filter.key === activeFilter)?.label
      || i18n.t(`notifications.${activeFilter}`);

    return {
      title: i18n.t('notifications.emptyFilterTitle', { filter: filterLabel }),
      subtitle: i18n.t('notifications.emptyFilterSubtitle'),
    };
  }, [activeFilter, filters]);

  const renderNotification = useCallback(({ item: notification }) => (
    <NotificationItem
      notification={notification}
      onMarkAsRead={markAsRead}
      onDelete={deleteNotification}
    />
  ), [markAsRead, deleteNotification]);

  const emptyComponent = useMemo(() => (
    <EmptyState
      icon="notifications-off"
      title={emptyStateContent.title}
      subtitle={emptyStateContent.subtitle}
    />
  ), [emptyStateContent]);

  if (!isAuthenticated || !driver) {
    return (
      <AuthGuard
        isAuthenticated={isAuthenticated}
        driver={driver}
        subtitle={i18n.t('notifications.reconnectSubtitle')}
      />
    );
  }

  return (
    <ScreenLayout
      title={i18n.t('notifications.title')}
      titleAccessory={unreadCount > 0 ? (
        <Badge
          value={unreadCount}
          status="error"
          containerStyle={styles.headerBadgeContainer}
        />
      ) : null}
      rightComponent={unreadCount > 0 ? (
        <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
          <Text style={styles.markAllText}>{i18n.t('notifications.markAllAsRead')}</Text>
        </TouchableOpacity>
      ) : null}
    >
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

      {hasCompletedOnboarding && (
        <FlatList
          style={styles.list}
          data={filteredNotifications}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderNotification}
          ListEmptyComponent={emptyComponent}
          contentContainerStyle={
            filteredNotifications.length === 0 ? styles.emptyList : styles.notificationsList
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
          initialNumToRender={10}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews
          ListFooterComponent={<View style={styles.bottomSpacer} />}
        />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  emptyList: {
    flexGrow: 1,
  },
  notificationsList: {
    padding: 16,
  },
  bottomSpacer: {
    height: 20,
  },
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
  headerBadgeContainer: {
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
