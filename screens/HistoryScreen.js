import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Dimensions,
  Alert
} from 'react-native';
import { Card, Icon, Chip } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';

// Import shared components and utilities
import {
  ScreenHeader,
  EmptyState,
  FilterButtons,
  StatsGrid,
  AuthGuard
} from '../components';
import { useDeliveriesGrouping } from '../hooks';
import {
  formatCurrency,
  formatDate,
  formatTime,
  formatOrderNumber,
  getStatusColor,
  TIME_FILTERS
} from '../utils';

const { width } = Dimensions.get('window');

export default function HistoryScreen() {
  const {
    deliveries,
    loadDriverOrders,
    invalidateDeliveriesCache
  } = useDriver();

  const { currency } = useSettings();

  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Utiliser le hook personnalisé pour le groupement des livraisons
  const { groupedDeliveries, globalStats } = useDeliveriesGrouping(deliveries, activeFilter);

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

  return (
    <SafeAreaView style={styles.container}>
      <AuthGuard />

      <ScreenHeader
        title={i18n.t('reports.historyTitle')}
        subtitle={`${globalStats.periodDeliveries} ${globalStats.periodDeliveries === 1 ? i18n.t('reports.deliverySingular') : i18n.t('reports.deliveryPlural')} • ${formatCurrency(globalStats.periodEarnings, currency)}`}
      />

      {/* Filtres temporels */}
      <FilterButtons
        filters={TIME_FILTERS}
        activeFilter={activeFilter}
        onFilterPress={setActiveFilter}
      />

      {/* Statistiques de la période */}
      <StatsGrid
        stats={[
          {
            value: globalStats.periodDeliveries,
            label: i18n.t('reports.deliveriesLabel')
          },
          {
            value: formatCurrency(globalStats.periodEarnings, currency),
            label: i18n.t('reports.earningsLabel')
          },
          {
            value: formatCurrency(globalStats.averageEarnings, currency),
            label: i18n.t('reports.averageLabel')
          }
        ]}
      />

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
          <EmptyState
            icon="history"
            iconType="material"
            title={i18n.t('reports.noHistory')}
            subtitle={activeFilter === 'all'
              ? i18n.t('reports.noDeliveriesYet')
              : i18n.t('reports.noDeliveriesFound')
            }
          />
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
                            {i18n.t('reports.orderPrefix')}{formatOrderNumber(delivery._id)}
                          </Text>
                          <Text style={styles.deliveryTime}>
                            {formatTime(delivery.createdAt || delivery.updatedAt)}
                          </Text>
                        </View>

                        <View style={styles.deliveryAmount}>
                          <Text style={styles.amountValue}>
                            +{formatCurrency(delivery.delivery?.deliveryFee || 0, currency)}
                          </Text>
                          <Chip
                            title={i18n.t('reports.delivered')}
                            buttonStyle={{ backgroundColor: getStatusColor('delivered') }}
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

  // ScrollView and content
  scrollView: {
    flex: 1,
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
    height: 35,
    backgroundColor: colors.success,
    borderRadius: 10,
  },
  statusChipText: {
    fontSize: 12,
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
