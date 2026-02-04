import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';
import { useRecentDeliveries, useEarningsRefresh } from '../hooks';

// Import components
import {
  AuthGuard,
  ScreenHeader,
  RatingStats
} from '../components';

export default function RatingScreen() {
  const {
    stats,
    loadDriverStats,
    invalidateDriverStatsCache,
    deliveries
  } = useDriver();

  const { currency } = useSettings();

  // Hooks personnalisés
  const recentDeliveries = useRecentDeliveries(deliveries, { days: 30, limit: 10, status: 'delivered' });
  const { refreshing, onRefresh } = useEarningsRefresh({ invalidateDriverStatsCache, loadDriverStats });

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={i18n.t('reports.ratingsTitle')}
        subtitle={`${stats.completedOrders || 0} ${i18n.t('reports.deliveriesRated')}`}
      />

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
        {/* <RatingStats stats={stats} currency={currency} /> */}

        {/* Section des livraisons récentes */}
        {recentDeliveries.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>{i18n.t('reports.recentDeliveries')}</Text>
            <Text style={styles.sectionSubtitle}>
              {i18n.t('reports.last30Days')}
            </Text>

            {recentDeliveries.slice(0, 5).map((delivery) => (
              <View key={delivery._id} style={styles.deliveryItem}>
                <View style={styles.deliveryInfo}>
                  <Text style={styles.deliveryId}>#{delivery._id.slice(-6)}</Text>
                  <Text style={styles.deliveryDate}>
                    {new Date(delivery.createdAt).toLocaleDateString(i18n.locale)}
                  </Text>
                </View>
                <View style={styles.deliveryRating}>
                  <Text style={styles.ratingText}>
                    ⭐ {stats.rating?.toFixed(1) || '0.0'}
                  </Text>
                </View>
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
  scrollView: {
    flex: 1,
  },
  recentSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  deliveryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryId: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  deliveryDate: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  deliveryRating: {
    alignItems: 'flex-end',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.warning,
  },
  bottomSpacer: {
    height: 20,
  },
});
