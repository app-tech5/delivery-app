import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';

import {
  ScreenLayout,
  VehicleInfoCard
} from '../components';

export default function VehicleDetailsScreen() {
  const { driver, isAuthenticated } = useDriver();
  
  const vehicle = driver?.vehicle || {};

  return (
    <ScreenLayout
      title={i18n.t('vehicle.vehicleDetailsTitle')}
      subtitle={i18n.t('vehicle.vehicleManagement')}
    >
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={false}
            colors={[colors.primary]}
          />
        }
      >
        <VehicleInfoCard vehicle={vehicle} />

        {}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>{i18n.t('vehicle.vehicleStats')}</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{driver?.totalDeliveries || 0}</Text>
              <Text style={styles.statLabel}>{i18n.t('vehicle.totalDeliveries')}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{driver?.rating?.toFixed(1) || '0.0'}</Text>
              <Text style={styles.statLabel}>{i18n.t('vehicle.averageRating')}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{i18n.t('vehicle.active')}</Text>
              <Text style={styles.statLabel}>{i18n.t('vehicle.status')}</Text>
            </View>
          </View>
        </View>

        {}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>{i18n.t('vehicle.maintenanceTips')}</Text>

          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{i18n.t('vehicle.regularMaintenance')}</Text>
            </View>

            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{i18n.t('vehicle.cleanVehicle')}</Text>
            </View>

            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{i18n.t('vehicle.checkTires')}</Text>
            </View>

            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{i18n.t('vehicle.reportIssues')}</Text>
            </View>
          </View>
        </View>

        {}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  statsSection: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  tipsSection: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  tipsList: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 16,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  tipBullet: {
    fontSize: 16,
    color: colors.primary,
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
    flex: 1,
  },
  bottomSpacer: {
    height: 20,
  },
});

