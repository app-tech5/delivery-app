import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert
} from 'react-native';
import { Card, Icon, Chip } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';

const { width } = Dimensions.get('window');

export default function HistoryScreen() {
  const {
    deliveries,
    isAuthenticated,
    driver,
    loadDriverOrders,
    invalidateDeliveriesCache
  } = useDriver();

  const { currency } = useSettings();

  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Filtres temporels disponibles
  const timeFilters = [
    { key: 'all', label: i18n.t('history.filters.all'), icon: 'calendar' },
    { key: 'today', label: i18n.t('history.filters.today'), icon: 'calendar-today' },
    { key: 'week', label: i18n.t('history.filters.week'), icon: 'calendar-week' },
    { key: 'month', label: i18n.t('history.filters.month'), icon: 'calendar-month' },
    { key: 'last_month', label: i18n.t('history.filters.last_month'), icon: 'calendar-month-outline' },
  ];
  
  // Grouper les livraisons par date
  const groupedDeliveries = useMemo(() => {
    const completedDeliveries = deliveries.filter(delivery => delivery.status === 'delivered');

    // Filtrer selon la période sélectionnée
    let filtered = completedDeliveries;
    const now = new Date();

    switch (activeFilter) {
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filtered = completedDeliveries.filter(d =>
          new Date(d.createdAt || d.updatedAt) >= today
        );
        break;
      case 'week':
        const weekStart = new Date();
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        filtered = completedDeliveries.filter(d =>
          new Date(d.createdAt || d.updatedAt) >= weekStart
        );
        break;
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = completedDeliveries.filter(d =>
          new Date(d.createdAt || d.updatedAt) >= monthStart
        );
        break;
      case 'last_month':
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = completedDeliveries.filter(d => {
          const date = new Date(d.createdAt || d.updatedAt);
          return date >= lastMonthStart && date < lastMonthEnd;
        });
        break;
    }

    // Grouper par date
    const groups = {};
    filtered.forEach(delivery => {
      const date = new Date(delivery.createdAt || delivery.updatedAt);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: date,
          deliveries: [],
          totalEarnings: 0,
          count: 0
        };
      }

      groups[dateKey].deliveries.push(delivery);
      groups[dateKey].totalEarnings += delivery.delivery?.deliveryFee || 0;
      groups[dateKey].count += 1;
    });

    // Convertir en array et trier par date décroissante
    return Object.values(groups).sort((a, b) => b.date - a.date);
  }, [deliveries, activeFilter]);

  // Statistiques globales
  const globalStats = useMemo(() => {
    const completedDeliveries = deliveries.filter(d => d.status === 'delivered');
    const totalEarnings = completedDeliveries.reduce((sum, d) => sum + (d.delivery?.deliveryFee || 0), 0);
    const totalDeliveries = completedDeliveries.length;

    // Statistiques de la période filtrée
    const periodDeliveries = groupedDeliveries.reduce((sum, group) => sum + group.count, 0);
    const periodEarnings = groupedDeliveries.reduce((sum, group) => sum + group.totalEarnings, 0);

    return {
      totalDeliveries,
      totalEarnings,
      periodDeliveries,
      periodEarnings,
      averageEarnings: periodDeliveries > 0 ? periodEarnings / periodDeliveries : 0
    };
  }, [deliveries, groupedDeliveries]);

  // Gestionnaire de pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await invalidateDeliveriesCache();
      await loadDriverOrders();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      Alert.alert('Erreur', 'Impossible de rafraîchir l\'historique');
    } finally {
      setRefreshing(false);
    }
  };

  // Fonction pour formater les montants
  const formatCurrency = (amount) => {
    return `${amount?.toFixed(2) || '0.00'}${currency?.symbol || '€'}`;
  };

  // Fonction pour formater les dates
  const formatDate = (date) => {
    const locale = i18n.locale;
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return i18n.t('reports.today');
    if (diffDays === 2) return i18n.t('reports.yesterday');

    return date.toLocaleDateString(i18n.locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return colors.success;
      case 'cancelled': return colors.error;
      default: return colors.text.secondary;
    }
  };

  // Vérifier l'authentification
  if (!isAuthenticated || !driver) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.title}>{i18n.t('home.reconnect')}</Text>
          <Text style={styles.subtitle}>{i18n.t('reports.pleaseReconnectHistory')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{i18n.t('reports.historyTitle')}</Text>
        <Text style={styles.headerSubtitle}>
          {globalStats.periodDeliveries} {globalStats.periodDeliveries === 1 ? i18n.t('reports.deliverySingular') : i18n.t('reports.deliveryPlural')} • {formatCurrency(globalStats.periodEarnings)}
        </Text>
      </View>

      {/* Filtres temporels */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {timeFilters.map((filter) => (
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
                type="material-community"
                size={18}
                color={activeFilter === filter.key ? colors.white : colors.primary}
              />
              <Text style={[
                styles.filterText,
                activeFilter === filter.key && styles.filterTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Statistiques de la période */}
      <View style={styles.statsContainer}>
        <Card containerStyle={styles.statsCard}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{globalStats.periodDeliveries}</Text>
              <Text style={styles.statLabel}>{i18n.t('reports.deliveriesLabel')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatCurrency(globalStats.periodEarnings)}</Text>
              <Text style={styles.statLabel}>{i18n.t('reports.earningsLabel')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatCurrency(globalStats.averageEarnings)}</Text>
              <Text style={styles.statLabel}>{i18n.t('reports.averageLabel')}</Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Chronologie des livraisons */}
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
        {groupedDeliveries.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon
              name="history"
              type="material"
              size={64}
              color={colors.text.secondary}
            />
            <Text style={styles.emptyTitle}>
              {i18n.t('reports.noHistory')}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === 'all'
                ? i18n.t('reports.noDeliveriesYet')
                : i18n.t('reports.noDeliveriesFound')
              }
            </Text>
          </View>
        ) : (
          <View style={styles.timelineContainer}>
            {groupedDeliveries.map((group, groupIndex) => (
              <View key={group.date.toISOString()}>
                {/* En-tête de groupe (date) */}
                <View style={styles.dateHeader}>
                  <View style={styles.dateLine} />
                  <View style={styles.dateContent}>
                    <Text style={styles.dateText}>{formatDate(group.date)}</Text>
                    <View style={styles.dateStats}>
                      <Text style={styles.dateDeliveries}>{group.count} {group.count === 1 ? i18n.t('reports.deliverySingular') : i18n.t('reports.deliveryPlural')}</Text>
                      <Text style={styles.dateEarnings}>{formatCurrency(group.totalEarnings)}</Text>
                    </View>
                  </View>
                  <View style={styles.dateLine} />
                </View>

                {/* Livraisons du jour */}
                {group.deliveries.map((delivery, deliveryIndex) => (
                  <View key={delivery._id} style={styles.deliveryItem}>
                    <View style={styles.timelineConnector}>
                      <View style={styles.timelineDot} />
                      {deliveryIndex < group.deliveries.length - 1 && (
                        <View style={styles.timelineLine} />
                      )}
                    </View>

                    <Card containerStyle={styles.deliveryCard}>
                      <View style={styles.deliveryHeader}>
                        <View style={styles.deliveryInfo}>
                          <Text style={styles.deliveryId}>
                            {i18n.t('reports.orderPrefix')}{delivery._id.slice(-6)}
                          </Text>
                          <Text style={styles.deliveryTime}>
                            {new Date(delivery.createdAt || delivery.updatedAt).toLocaleTimeString(i18n.locale, {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Text>
                        </View>

                        <View style={styles.deliveryAmount}>
                          <Text style={styles.amountValue}>
                            +{formatCurrency(delivery.delivery?.deliveryFee || 0)}
                          </Text>
                          <Chip
                            title="Livrée"
                            buttonStyle={styles.statusChip}
                            titleStyle={styles.statusChipText}
                          />
                        </View>
                      </View>

                      <View style={styles.deliveryDetails}>
                        <Text style={styles.deliveryAddress}>
                          📍 {delivery.delivery?.address || 'Adresse non disponible'}
                        </Text>

                        {delivery.user && (
                          <Text style={styles.customerInfo}>
                            👤 {delivery.user.name}
                          </Text>
                        )}

                        {delivery.restaurant && (
                          <Text style={styles.restaurantInfo}>
                            🏪 {delivery.restaurant.name}
                          </Text>
                        )}
                      </View>
                    </Card>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Espace en bas pour le scroll */}
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

  // Header
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
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
  },
  filterTextActive: {
    color: colors.white,
  },

  // Stats
  statsContainer: {
    padding: 16,
  },
  statsCard: {
    borderRadius: 12,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  // ScrollView and content
  scrollView: {
    flex: 1,
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Timeline
  timelineContainer: {
    paddingHorizontal: 16,
  },

  // Date header
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.background.secondary,
  },
  dateContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  dateStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateDeliveries: {
    fontSize: 12,
    color: colors.text.secondary,
    marginRight: 12,
  },
  dateEarnings: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
  },

  // Delivery item
  deliveryItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineConnector: {
    alignItems: 'center',
    width: 20,
    marginRight: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginTop: 16,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.background.secondary,
    marginTop: 8,
  },

  // Delivery card
  deliveryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },

  // Delivery header
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 2,
  },
  deliveryTime: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  deliveryAmount: {
    alignItems: 'flex-end',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: 4,
  },
  statusChip: {
    height: 20,
    backgroundColor: colors.success,
    borderRadius: 10,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '500',
  },

  // Delivery details
  deliveryDetails: {
    marginTop: 8,
  },
  deliveryAddress: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 4,
    lineHeight: 20,
  },
  customerInfo: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  restaurantInfo: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 2,
    fontWeight: '500',
  },

  // Bottom spacer
  bottomSpacer: {
    height: 20,
  },
});
