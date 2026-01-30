import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions
} from 'react-native';
import { Icon } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';
import { DeliveryCard } from '../components';

const { width } = Dimensions.get('window');

export default function DeliveriesScreen() {
  const {
    deliveries,
    isAuthenticated,
    driver,
    updateDeliveryStatus,
    acceptDelivery,
    loadDriverOrders,
    invalidateDeliveriesCache
  } = useDriver();

  const { currency } = useSettings();

  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filtres disponibles
  const filters = [
    { key: 'all', label: i18n.t('common.all'), icon: 'list' },
    { key: 'pending', label: i18n.t('reports.pendingLabel'), icon: 'clock-outline' },
    { key: 'accepted', label: i18n.t('reports.acceptedLabel'), icon: 'check-circle-outline' },
    { key: 'out_for_delivery', label: i18n.t('reports.outForDeliveryLabel'), icon: 'truck-delivery' },
    { key: 'delivered', label: i18n.t('reports.deliveredLabel'), icon: 'check-circle' },
    { key: 'cancelled', label: i18n.t('reports.cancelledLabel'), icon: 'close-circle' }
  ];

  // Filtrer les livraisons selon le filtre actif
  const filteredDeliveries = deliveries.filter(delivery => {
    if (activeFilter === 'all') return true;
    return delivery.status === activeFilter;
  });


  // Gestionnaire de pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await invalidateDeliveriesCache();
      await loadDriverOrders();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      Alert.alert('Error', i18n.t('reports.refreshError'));
    } finally {
      setRefreshing(false);
    }
  };

  // Gestionnaire pour accepter une livraison
  const handleAcceptDelivery = async (orderId) => {
    Alert.alert(
      i18n.t('reports.acceptDeliveryTitle'),
      i18n.t('reports.acceptDeliveryConfirm'),
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('common.confirm'),
          onPress: async () => {
            setLoading(true);
            try {
              await acceptDelivery(orderId);
              Alert.alert('Success', i18n.t('reports.acceptSuccess'));
            } catch (error) {
              console.error('Erreur lors de l\'acceptation:', error);
              Alert.alert('Error', i18n.t('reports.acceptError'));
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Gestionnaire pour changer le statut d'une livraison
  const handleStatusChange = async (orderId, newStatus, confirmMessage) => {
    Alert.alert(
      'Change Status',
      confirmMessage,
      [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('common.confirm'),
          onPress: async () => {
            setLoading(true);
            try {
              await updateDeliveryStatus(orderId, newStatus);
              Alert.alert('Success', i18n.t('reports.updateSuccess'));
            } catch (error) {
              console.error('Erreur lors de la mise à jour:', error);
              Alert.alert('Error', i18n.t('reports.updateError'));
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
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
        <Text style={styles.headerTitle}>{i18n.t('navigation.deliveries')}</Text>
        <Text style={styles.headerSubtitle}>
          {filteredDeliveries.length} {filteredDeliveries.length === 1 ? i18n.t('reports.deliverySingular') : i18n.t('reports.deliveryPlural')}
        </Text>
      </View>

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

      {/* Liste des livraisons */}
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
        {filteredDeliveries.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon
              name="package-variant-closed"
              type="material-community"
              size={64}
              color={colors.text.secondary}
            />
            <Text style={styles.emptyTitle}>
              {activeFilter === 'all' ? i18n.t('reports.noDeliveries') : i18n.t('reports.noDeliveriesFiltered')}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === 'all'
                ? i18n.t('reports.noDeliveriesAtAll')
                : `Aucune livraison avec le statut "${filters.find(f => f.key === activeFilter)?.label}"`
              }
            </Text>
          </View>
        ) : (
          <View style={styles.deliveriesList}>
            {filteredDeliveries.map((delivery) => (
              <DeliveryCard
                key={delivery._id}
                delivery={delivery}
                onAccept={handleAcceptDelivery}
                onStartDelivery={(id) => handleStatusChange(
                  id,
                  'out_for_delivery',
                  i18n.t('reports.startDeliveryConfirm')
                )}
                onMarkDelivered={(id) => handleStatusChange(
                  id,
                  'delivered',
                  i18n.t('reports.completeDeliveryConfirm')
                )}
              />
            ))}
          </View>
        )}
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

  // Header styles
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

  // Filters styles
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

  // Deliveries list
  deliveriesList: {
    padding: 16,
  },
});