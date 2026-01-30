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
import { Card, Button, Icon, Chip } from 'react-native-elements';
import { colors } from '../global';
import i18n from '../i18n';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';

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
    { key: 'pending', label: 'En attente', icon: 'clock-outline' },
    { key: 'accepted', label: 'Acceptées', icon: 'check-circle-outline' },
    { key: 'out_for_delivery', label: 'En livraison', icon: 'truck-delivery' },
    { key: 'delivered', label: 'Livrées', icon: 'check-circle' },
    { key: 'cancelled', label: 'Annulées', icon: 'close-circle' }
  ];

  // Filtrer les livraisons selon le filtre actif
  const filteredDeliveries = deliveries.filter(delivery => {
    if (activeFilter === 'all') return true;
    return delivery.status === activeFilter;
  });

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'accepted': return colors.info;
      case 'out_for_delivery': return colors.primary;
      case 'delivered': return colors.success;
      case 'cancelled': return colors.error;
      default: return colors.text.secondary;
    }
  };

  // Fonction pour obtenir le label du statut
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'accepted': return 'Acceptée';
      case 'out_for_delivery': return 'En livraison';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  // Gestionnaire de pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await invalidateDeliveriesCache();
      await loadDriverOrders();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      Alert.alert('Erreur', 'Impossible de rafraîchir les livraisons');
    } finally {
      setRefreshing(false);
    }
  };

  // Gestionnaire pour accepter une livraison
  const handleAcceptDelivery = async (orderId) => {
    Alert.alert(
      'Accepter la livraison',
      'Êtes-vous sûr de vouloir accepter cette livraison ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Accepter',
          onPress: async () => {
            setLoading(true);
            try {
              await acceptDelivery(orderId);
              Alert.alert('Succès', 'Livraison acceptée avec succès');
            } catch (error) {
              console.error('Erreur lors de l\'acceptation:', error);
              Alert.alert('Erreur', 'Impossible d\'accepter la livraison');
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
      'Changer le statut',
      confirmMessage,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            setLoading(true);
            try {
              await updateDeliveryStatus(orderId, newStatus);
              Alert.alert('Succès', 'Statut mis à jour avec succès');
            } catch (error) {
              console.error('Erreur lors de la mise à jour:', error);
              Alert.alert('Erreur', 'Impossible de mettre à jour le statut');
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
          <Text style={styles.subtitle}>Veuillez vous reconnecter pour voir vos livraisons</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{i18n.t('navigation.deliveries')}</Text>
        <Text style={styles.headerSubtitle}>
          {filteredDeliveries.length} livraison{filteredDeliveries.length !== 1 ? 's' : ''}
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
              {activeFilter === 'all' ? 'Aucune livraison' : 'Aucune livraison trouvée'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === 'all'
                ? 'Vous n\'avez encore aucune livraison'
                : `Aucune livraison avec le statut "${filters.find(f => f.key === activeFilter)?.label}"`
              }
            </Text>
          </View>
        ) : (
          <View style={styles.deliveriesList}>
            {filteredDeliveries.map((delivery) => (
              <Card key={delivery._id} containerStyle={styles.deliveryCard}>
                <View style={styles.deliveryHeader}>
                  <View style={styles.deliveryInfo}>
                    <Text style={styles.deliveryId}>
                      Commande #{delivery._id.slice(-6)}
                    </Text>
                    <Chip
                      title={getStatusLabel(delivery.status)}
                      buttonStyle={[
                        styles.statusChip,
                        { backgroundColor: getStatusColor(delivery.status) }
                      ]}
                      titleStyle={styles.statusChipText}
                    />
                  </View>
                  <Text style={styles.deliveryDate}>
                    {delivery.createdAt ? new Date(delivery.createdAt).toLocaleDateString('fr-FR') : ''}
                  </Text>
                </View>

                <View style={styles.deliveryDetails}>
                  <Text style={styles.deliveryAddress}>
                    📍 {delivery.delivery?.address || 'Adresse non disponible'}
                  </Text>

                  {delivery.user && (
                    <Text style={styles.customerInfo}>
                      👤 {delivery.user.name} - {delivery.user.phone}
                    </Text>
                  )}

                  {delivery.restaurant && (
                    <Text style={styles.restaurantInfo}>
                      🏪 {delivery.restaurant.name}
                    </Text>
                  )}

                  <View style={styles.amountSection}>
                    <Text style={styles.amountLabel}>{i18n.t('common.amount')}:</Text>
                    <Text style={styles.amountValue}>
                      {delivery.totalPrice || 0}{currency?.symbol || '€'}
                    </Text>
                  </View>
                </View>

                {/* Actions selon le statut */}
                <View style={styles.deliveryActions}>
                  {delivery.status === 'pending' && (
                    <Button
                      title="Accepter"
                      onPress={() => handleAcceptDelivery(delivery._id)}
                      loading={loading}
                      buttonStyle={styles.acceptButton}
                      icon={
                        <Icon
                          name="check"
                          type="material"
                          size={16}
                          color={colors.white}
                          style={{ marginRight: 8 }}
                        />
                      }
                    />
                  )}

                  {delivery.status === 'accepted' && (
                    <Button
                      title="Commencer la livraison"
                      onPress={() => handleStatusChange(
                        delivery._id,
                        'out_for_delivery',
                        'Êtes-vous sûr de vouloir commencer cette livraison ?'
                      )}
                      loading={loading}
                      buttonStyle={styles.startDeliveryButton}
                    />
                  )}

                  {delivery.status === 'out_for_delivery' && (
                    <Button
                      title="Marquer comme livrée"
                      onPress={() => handleStatusChange(
                        delivery._id,
                        'delivered',
                        'Êtes-vous sûr que cette livraison est terminée ?'
                      )}
                      loading={loading}
                      buttonStyle={styles.deliverButton}
                      icon={
                        <Icon
                          name="check-circle"
                          type="material"
                          size={16}
                          color={colors.white}
                          style={{ marginRight: 8 }}
                        />
                      }
                    />
                  )}
                </View>
              </Card>
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
  deliveryCard: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
  },

  // Delivery card header
  deliveryHeader: {
    marginBottom: 12,
  },
  deliveryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  statusChip: {
    height: 24,
    borderRadius: 12,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deliveryDate: {
    fontSize: 12,
    color: colors.text.secondary,
  },

  // Delivery details
  deliveryDetails: {
    marginBottom: 16,
  },
  deliveryAddress: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 8,
    lineHeight: 20,
  },
  customerInfo: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  restaurantInfo: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  amountSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: 12,
    borderRadius: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },

  // Delivery actions
  deliveryActions: {
    marginTop: 8,
  },
  acceptButton: {
    backgroundColor: colors.success,
    borderRadius: 8,
  },
  startDeliveryButton: {
    backgroundColor: colors.info,
    borderRadius: 8,
  },
  deliverButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
});