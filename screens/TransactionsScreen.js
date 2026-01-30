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

export default function TransactionsScreen() {
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

  // Filtres de période disponibles
  const periodFilters = [
    { key: 'all', label: i18n.t('common.all'), days: null },
    { key: 'today', label: i18n.t('reports.todayFilter'), days: 0 },
    { key: 'week', label: i18n.t('reports.weekFilter'), days: 7 },
    { key: 'month', label: i18n.t('reports.monthFilter'), days: 30 },
  ];

  // Calculer les transactions depuis les livraisons
  const transactions = useMemo(() => {
    const completedDeliveries = deliveries.filter(delivery => delivery.status === 'delivered');

    return completedDeliveries
      .map(delivery => ({
        id: delivery._id,
        type: 'delivery_fee',
        amount: delivery.delivery?.deliveryFee || 0,
        description: `${i18n.t('reports.deliveryDescription')}${delivery._id.slice(-6)}`,
        date: new Date(delivery.createdAt || delivery.updatedAt),
        status: 'completed',
        details: {
          address: delivery.delivery?.address,
          customer: delivery.user?.name,
          restaurant: delivery.restaurant?.name
        }
      }))
      .sort((a, b) => b.date - a.date); // Plus récent en premier
  }, [deliveries]);

  // Filtrer les transactions selon la période
  const filteredTransactions = useMemo(() => {
    if (activeFilter === 'all') return transactions;

    const filter = periodFilters.find(f => f.key === activeFilter);
    if (!filter || filter.days === null) return transactions;

    const cutoffDate = new Date();
    if (filter.days === 0) {
      // Aujourd'hui
      cutoffDate.setHours(0, 0, 0, 0);
    } else {
      cutoffDate.setDate(cutoffDate.getDate() - filter.days);
    }

    return transactions.filter(transaction => transaction.date >= cutoffDate);
  }, [transactions, activeFilter]);

  // Calculer les statistiques des transactions filtrées
  const transactionStats = useMemo(() => {
    const total = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const count = filteredTransactions.length;
    const average = count > 0 ? total / count : 0;

    return {
      total,
      count,
      average
    };
  }, [filteredTransactions]);

  // Gestionnaire de pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await invalidateDeliveriesCache();
      await loadDriverOrders();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      Alert.alert('Error', i18n.t('reports.refreshTransactionsError'));
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
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return i18n.t('reports.today');
    if (diffDays === 2) return i18n.t('reports.yesterday');
    if (diffDays <= 7) return `${diffDays - 1} ${i18n.t('reports.daysAgo')}`;

    return date.toLocaleDateString(i18n.locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Fonction pour obtenir la couleur du type de transaction
  const getTransactionColor = (type) => {
    switch (type) {
      case 'delivery_fee': return colors.success;
      case 'bonus': return colors.primary;
      case 'penalty': return colors.error;
      default: return colors.text.secondary;
    }
  };

  // Fonction pour obtenir l'icône du type de transaction
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'delivery_fee': return 'truck-delivery';
      case 'bonus': return 'gift';
      case 'penalty': return 'alert-circle';
      default: return 'cash';
    }
  };

  // Vérifier l'authentification
  if (!isAuthenticated || !driver) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.title}>{i18n.t('home.reconnect')}</Text>
          <Text style={styles.subtitle}>{i18n.t('reports.pleaseReconnectTransactions')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{i18n.t('reports.transactionsTitle')}</Text>
        <Text style={styles.headerSubtitle}>
          {transactionStats.count} {transactionStats.count === 1 ? i18n.t('reports.transactionSingular') : i18n.t('reports.transactionPlural')}
        </Text>
      </View>

      {/* Filtres de période */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {periodFilters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => setActiveFilter(filter.key)}
              style={[
                styles.filterButton,
                activeFilter === filter.key && styles.filterButtonActive
              ]}
            >
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

      {/* Résumé des transactions */}
      <View style={styles.summaryContainer}>
        <Card containerStyle={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{i18n.t('reports.totalLabel')}</Text>
            <Text style={styles.summaryValue}>{formatCurrency(transactionStats.total)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{i18n.t('reports.countLabel')}</Text>
            <Text style={styles.summaryValue}>{transactionStats.count}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{i18n.t('reports.averageLabel')}</Text>
            <Text style={styles.summaryValue}>{formatCurrency(transactionStats.average)}</Text>
          </View>
        </Card>
      </View>

      {/* Liste des transactions */}
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
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon
              name="receipt"
              type="material"
              size={64}
              color={colors.text.secondary}
            />
            <Text style={styles.emptyTitle}>
              {activeFilter === 'all' ? i18n.t('reports.noTransactions') : i18n.t('reports.noTransactionsFiltered')}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === 'all'
                ? i18n.t('reports.noTransactionsAtAll')
                : i18n.t('reports.noTransactionsForPeriod')
              }
            </Text>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {filteredTransactions.map((transaction) => (
              <Card key={transaction.id} containerStyle={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionIcon}>
                    <Icon
                      name={getTransactionIcon(transaction.type)}
                      type="material-community"
                      size={20}
                      color={getTransactionColor(transaction.type)}
                    />
                  </View>

                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDescription}>
                      {transaction.description}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(transaction.date)}
                    </Text>
                  </View>

                  <View style={styles.transactionAmount}>
                    <Text style={[
                      styles.amountValue,
                      { color: getTransactionColor(transaction.type) }
                    ]}>
                      +{formatCurrency(transaction.amount)}
                    </Text>
                    <Chip
                      title={i18n.t('reports.completedStatus')}
                      buttonStyle={styles.statusChip}
                      titleStyle={styles.statusChipText}
                    />
                  </View>
                </View>

                {/* Détails supplémentaires */}
                {(transaction.details?.address || transaction.details?.customer) && (
                  <View style={styles.transactionDetails}>
                    {transaction.details?.address && (
                      <Text style={styles.detailText}>
                        📍 {transaction.details.address}
                      </Text>
                    )}
                    {transaction.details?.customer && (
                      <Text style={styles.detailText}>
                        👤 {transaction.details.customer}
                      </Text>
                    )}
                    {transaction.details?.restaurant && (
                      <Text style={styles.detailText}>
                        🏪 {transaction.details.restaurant}
                      </Text>
                    )}
                  </View>
                )}
              </Card>
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
  },
  filterTextActive: {
    color: colors.white,
  },

  // Summary
  summaryContainer: {
    padding: 16,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
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

  // Transactions list
  transactionsList: {
    padding: 16,
  },
  transactionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },

  // Transaction header
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusChip: {
    height: 24,
    backgroundColor: colors.success,
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Transaction details
  transactionDetails: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.background.secondary,
  },
  detailText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
    lineHeight: 20,
  },

  // Bottom spacer
  bottomSpacer: {
    height: 20,
  },
});
