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
import { Card, Icon } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';
import { StatCard } from '../components';

const { width } = Dimensions.get('window');

export default function EarningsScreen() {
  const {
    stats,
    isAuthenticated,
    driver,
    loadDriverStats,
    invalidateDriverStatsCache,
    deliveries
  } = useDriver();

  const { currency } = useSettings();

  const [refreshing, setRefreshing] = useState(false);
  const [recentDeliveries, setRecentDeliveries] = useState([]);

  // Calculer les livraisons récentes (derniers 7 jours)
  useEffect(() => {
    if (deliveries.length > 0) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recent = deliveries
        .filter(delivery => {
          const deliveryDate = new Date(delivery.createdAt || delivery.updatedAt);
          return deliveryDate >= sevenDaysAgo && delivery.status === 'delivered';
        })
        .sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt))
        .slice(0, 10); // Top 10 récentes

      setRecentDeliveries(recent);
    }
  }, [deliveries]);

  // Gestionnaire de pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await invalidateDriverStatsCache();
      await loadDriverStats();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des stats:', error);
      Alert.alert('Erreur', 'Impossible de rafraîchir les statistiques');
    } finally {
      setRefreshing(false);
    }
  };

  // Fonction pour formater les montants
  const formatCurrency = (amount) => {
    return `${amount?.toFixed(2) || '0.00'}${currency?.symbol || '€'}`;
  };

  // Fonction pour obtenir la couleur de la note
  const getRatingColor = (rating) => {
    if (rating >= 4.5) return colors.success;
    if (rating >= 4.0) return colors.warning;
    return colors.error;
  };

  // Fonction pour obtenir l'icône de tendance
  const getTrendIcon = (value, threshold = 0) => {
    if (value > threshold) return { name: 'trending-up', color: colors.success };
    if (value < threshold) return { name: 'trending-down', color: colors.error };
    return { name: 'trending-flat', color: colors.text.secondary };
  };

  // Vérifier l'authentification
  if (!isAuthenticated || !driver) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.title}>{i18n.t('home.reconnect')}</Text>
          <Text style={styles.subtitle}>Veuillez vous reconnecter pour voir vos revenus</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{i18n.t('home.earnings')}</Text>
        <Text style={styles.headerSubtitle}>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>
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
        {/* Cartes statistiques principales */}
        <View style={styles.statsGrid}>
          {/* Gains du jour */}
          <Card containerStyle={[styles.statCard, styles.todayEarningsCard]}>
            <View style={styles.statIcon}>
              <Icon
                name="cash"
                type="material-community"
                size={24}
                color={colors.white}
              />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{formatCurrency(stats.totalEarnings)}</Text>
              <Text style={styles.statLabel}>{i18n.t('home.earnings')} du jour</Text>
            </View>
            <View style={styles.trendContainer}>
              <Icon
                name={getTrendIcon(stats.totalEarnings, 10).name}
                type="material"
                size={16}
                color={colors.white}
              />
            </View>
          </Card>

          {/* Livraisons du jour */}
          <Card containerStyle={[styles.statCard, styles.todayDeliveriesCard]}>
            <View style={styles.statIcon}>
              <Icon
                name="truck-delivery"
                type="material-community"
                size={24}
                color={colors.white}
              />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{stats.todayDeliveries || 0}</Text>
              <Text style={styles.statLabel}>Livraisons du jour</Text>
            </View>
            <View style={styles.trendContainer}>
              <Icon
                name={getTrendIcon(stats.todayDeliveries, 2).name}
                type="material"
                size={16}
                color={colors.white}
              />
            </View>
          </Card>

          {/* Note moyenne */}
          <Card containerStyle={[styles.statCard, styles.ratingCard]}>
            <View style={styles.statIcon}>
              <Icon
                name="star"
                type="material"
                size={24}
                color={colors.white}
              />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{stats.rating?.toFixed(1) || '0.0'}</Text>
              <Text style={styles.statLabel}>{i18n.t('home.rating')}</Text>
            </View>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon
                  key={star}
                  name={star <= Math.floor(stats.rating || 0) ? 'star' : 'star-border'}
                  type="material"
                  size={12}
                  color={colors.white}
                />
              ))}
            </View>
          </Card>

          {/* Total livraisons */}
          <Card containerStyle={[styles.statCard, styles.totalDeliveriesCard]}>
            <View style={styles.statIcon}>
              <Icon
                name="package-variant-closed"
                type="material-community"
                size={24}
                color={colors.white}
              />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{stats.completedOrders || 0}</Text>
              <Text style={styles.statLabel}>Total livraisons</Text>
            </View>
            <View style={styles.trendContainer}>
              <Icon
                name="timeline"
                type="material"
                size={16}
                color={colors.white}
              />
            </View>
          </Card>
        </View>

        {/* Section des revenus détaillés */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Détails des revenus</Text>

          <Card containerStyle={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Livraisons complétées aujourd'hui</Text>
              <Text style={styles.detailValue}>{stats.todayDeliveries || 0}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Revenus moyens par livraison</Text>
              <Text style={styles.detailValue}>
                {stats.todayDeliveries > 0
                  ? formatCurrency(stats.totalEarnings / stats.todayDeliveries)
                  : formatCurrency(0)
                }
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Note moyenne</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.detailValue}>{stats.rating?.toFixed(1) || '0.0'}</Text>
                <View style={styles.miniStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon
                      key={star}
                      name={star <= Math.floor(stats.rating || 0) ? 'star' : 'star-border'}
                      type="material"
                      size={10}
                      color={getRatingColor(stats.rating || 0)}
                    />
                  ))}
                </View>
              </View>
            </View>
          </Card>
        </View>

        {/* Livraisons récentes */}
        {recentDeliveries.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Livraisons récentes</Text>

            {recentDeliveries.map((delivery) => (
              <Card key={delivery._id} containerStyle={styles.recentDeliveryCard}>
                <View style={styles.recentDeliveryHeader}>
                  <Text style={styles.recentDeliveryId}>
                    Commande #{delivery._id.slice(-6)}
                  </Text>
                  <Text style={styles.recentDeliveryDate}>
                    {new Date(delivery.createdAt || delivery.updatedAt).toLocaleDateString('fr-FR')}
                  </Text>
                </View>

                <View style={styles.recentDeliveryDetails}>
                  <Text style={styles.recentDeliveryAddress}>
                    📍 {delivery.delivery?.address || 'Adresse non disponible'}
                  </Text>

                  {delivery.user && (
                    <Text style={styles.recentDeliveryCustomer}>
                      👤 {delivery.user.name}
                    </Text>
                  )}

                  <View style={styles.recentDeliveryFooter}>
                    <Text style={styles.recentDeliveryAmount}>
                      {formatCurrency(delivery.delivery?.deliveryFee || 0)}
                    </Text>
                    <View style={styles.recentDeliveryStatus}>
                      <Icon
                        name="check-circle"
                        type="material"
                        size={14}
                        color={colors.success}
                      />
                      <Text style={styles.recentDeliveryStatusText}>Livrée</Text>
                    </View>
                  </View>
                </View>
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

  // ScrollView
  scrollView: {
    flex: 1,
  },

  // Stats grid
  statsGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 48) / 2, // 2 cards per row with margins
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 0,
  },

  // Individual stat card colors
  todayEarningsCard: {
    backgroundColor: colors.success,
  },
  todayDeliveriesCard: {
    backgroundColor: colors.primary,
  },
  ratingCard: {
    backgroundColor: colors.warning,
  },
  totalDeliveriesCard: {
    backgroundColor: colors.info,
  },

  statIcon: {
    marginBottom: 12,
  },
  statContent: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.9,
  },
  trendContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  ratingStars: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
  },

  // Details section
  detailsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  detailCard: {
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.secondary,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniStars: {
    flexDirection: 'row',
    marginLeft: 8,
  },

  // Recent deliveries section
  recentSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  recentDeliveryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  recentDeliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentDeliveryId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  recentDeliveryDate: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  recentDeliveryDetails: {
    marginBottom: 12,
  },
  recentDeliveryAddress: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 4,
    lineHeight: 20,
  },
  recentDeliveryCustomer: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  recentDeliveryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentDeliveryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  recentDeliveryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentDeliveryStatusText: {
    fontSize: 12,
    color: colors.success,
    marginLeft: 4,
    fontWeight: '500',
  },

  // Bottom spacer
  bottomSpacer: {
    height: 20,
  },
});
