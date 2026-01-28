import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Alert,
  Dimensions,
  Image
} from 'react-native';
import { Icon, Card, Button } from 'react-native-elements';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import Loader from './Loader';
import { colors } from '../global';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';
import { getNearbyRestaurants } from '../api';
import { loadNearbyRestaurantsWithSmartCache } from '../utils/cacheUtils';
import i18n from '../i18n';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const {
    driver,
    stats,
    deliveries,
    updateStatus,
    loadDriverStats,
    loadDriverOrders,
    isAuthenticated,
    isLoading: contextLoading
  } = useDriver();

  const { currency } = useSettings();

  const [localLoading, setLocalLoading] = useState(false);
  const isLoading = contextLoading || localLoading;

  // État pour la map et les restaurants proches
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(false);

  // Position du driver depuis ses données
  const driverLocation = driver?.location?.coordinates ? {
    latitude: driver.location.coordinates[1], // latitude
    longitude: driver.location.coordinates[0], // longitude
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  } : {
    latitude: 48.8566, // Paris par défaut
    longitude: 2.3522,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  // Charger les données du driver et les restaurants proches
  useEffect(() => {
    const initializeData = async () => {
      if (isAuthenticated) {
        // Charger les données du driver
        loadDriverStats();
        loadDriverOrders();

        // Charger les restaurants proches
        loadNearbyRestaurants();
      }
    };

    initializeData();
  }, [isAuthenticated, driver]); // Recharger quand le driver change (nouvelle position)

  // Gestionnaire de changement de statut du driver
  const handleStatusChange = async (newStatus) => {
    if (isLoading) return;

    setLocalLoading(true);

    try {
      await updateStatus(newStatus, currentLocation ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude
      } : null);

      Alert.alert(i18n.t('common.ok'), `${i18n.t('driver.statusChanged')} ${getStatusLabel(newStatus)}`);
    } catch (error) {
      Alert.alert(i18n.t('errors.networkError'), i18n.t('driver.statusUpdateError'));
    } finally {
      setLocalLoading(false);
    }
  };

  // Gestionnaire de changement de statut d'une commande
  const handleOrderStatusChange = async (orderId, newStatus) => {
    if (isLoading) return;

    setLocalLoading(true);

    try {
      await updateDeliveryStatus(orderId, newStatus);
      Alert.alert(i18n.t('common.ok'), `${i18n.t('driver.orderDelivered')} (${i18n.t('driver.simulation')})`);
    } catch (error) {
      Alert.alert(i18n.t('errors.networkError'), i18n.t('driver.statusUpdateError'));
    } finally {
      setLocalLoading(false);
    }
  };

  // Charger les restaurants proches avec cache intelligent
  const loadNearbyRestaurants = async () => {
    if (!driverLocation) return;

    try {
      // Utiliser le cache intelligent pour les restaurants proches
      await loadNearbyRestaurantsWithSmartCache(
        driverLocation.latitude,
        driverLocation.longitude,
        10, // rayon de 10km
        getNearbyRestaurants, // apiFetcher
        (data, fromCache) => {
          // onDataLoaded - appelé quand les données sont prêtes (cache ou API)
          setNearbyRestaurants(data);
          if (fromCache) {
            console.log('🔄 Restaurants proches chargés depuis le cache dans HomeScreen');
          }
        },
        (data) => {
          // onDataUpdated - appelé quand les données sont mises à jour depuis l'API
          setNearbyRestaurants(data);
          console.log('🔄 Restaurants proches mis à jour depuis l\'API dans HomeScreen');
        },
        (loading) => {
          // onLoadingStateChange
          setRestaurantsLoading(loading);
        },
        (errorMsg) => {
          // onError
          console.error('Erreur chargement restaurants proches:', errorMsg);
        }
      );
    } catch (error) {
      console.error('Error loading nearby restaurants with smart cache:', error);
    }
  };

  // Obtenir le label du statut
  const getStatusLabel = (status) => {
    switch (status) {
      case 'available': return i18n.t('driver.available');
      case 'on_delivery': return i18n.t('driver.onDelivery');
      case 'offline': return i18n.t('driver.offline');
      case 'busy': return i18n.t('driver.busy');
      default: return status;
    }
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return colors.driver.available;
      case 'on_delivery': return colors.driver.onDelivery;
      case 'offline': return colors.driver.offline;
      case 'busy': return colors.driver.busy;
      default: return colors.grey[500];
    }
  };

  // Commandes actives (en livraison)
  const activeDeliveries = deliveries.filter(delivery =>
    delivery.status === 'out_for_delivery'
  );

  // Vérifier l'authentification
  if (!isAuthenticated || !driver) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.title}>{i18n.t('home.reconnect')}</Text>
          <Button
            title={i18n.t('navigation.login')}
            onPress={() => navigation.navigate('Login')}
            buttonStyle={styles.loginButton}
          />
        </View>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header avec statut */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.driverInfo}>
              {driver?.userId?.image ? (
                <Image
                  source={{ uri: driver.userId.image }}
                  style={styles.driverImage}
                />
              ) : (
                <Icon
                  name="person"
                  type="material"
                  size={40}
                  color={colors.white}
                  containerStyle={styles.avatar}
                />
              )}
              <View>
                <Text style={styles.driverName}>
                  {driver?.userId?.name || i18n.t('driver.driver')}
                </Text>
                <Text style={styles.driverId}>
                  {i18n.t('driver.id')}: {driver?.licenseNumber || 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.statusContainer}>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor(driver?.status) }
              ]} />
              <Text style={styles.statusText}>
                {getStatusLabel(driver?.status)}
              </Text>
            </View>
          </View>
        </View>

        {/* Boutons de statut */}
        <View style={styles.statusButtons}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              driver?.status === 'available' && styles.statusButtonActive
            ]}
            onPress={() => handleStatusChange('available')}
            disabled={isLoading}
          >
            <Icon name="check-circle" type="material" size={24} color={colors.white} />
            <Text style={styles.statusButtonText}>{i18n.t('driver.available')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusButton,
              driver?.status === 'busy' && styles.statusButtonActive,
              styles.statusButtonBusy
            ]}
            onPress={() => handleStatusChange('busy')}
            disabled={isLoading}
          >
            <Icon name="work" type="material" size={24} color={colors.white} />
            <Text style={styles.statusButtonText}>{i18n.t('driver.busy')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusButton,
              driver?.status === 'offline' && styles.statusButtonActive,
              styles.statusButtonOffline
            ]}
            onPress={() => handleStatusChange('offline')}
            disabled={isLoading}
          >
            <Icon name="power-settings-new" type="material" size={24} color={colors.white} />
            <Text style={styles.statusButtonText}>{i18n.t('driver.offline')}</Text>
          </TouchableOpacity>
        </View>

        {/* Statistiques */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>{i18n.t('home.todayDeliveries')}</Text>
          <View style={styles.statsGrid}>
            <Card containerStyle={styles.statCard}>
              <Icon name="local-shipping" type="material" size={30} color={colors.primary} />
              <Text style={styles.statNumber}>{stats.todayDeliveries || 0}</Text>
              <Text style={styles.statLabel}>{i18n.t('home.todayDeliveries')}</Text>
            </Card>

            <Card containerStyle={styles.statCard}>
              <Icon name="attach-money" type="material" size={30} color={colors.success} />
              <Text style={styles.statNumber}>{stats.totalEarnings || 0}{currency.symbol}</Text>
              <Text style={styles.statLabel}>{i18n.t('home.earnings')}</Text>
            </Card>

            <Card containerStyle={styles.statCard}>
              <Icon name="star" type="material" size={30} color={colors.rating} />
              <Text style={styles.statNumber}>{stats.rating || 0}</Text>
              <Text style={styles.statLabel}>{i18n.t('home.rating')}</Text>
            </Card>
          </View>
        </View>

        {/* Livraisons actives */}
        {activeDeliveries.length > 0 && (
          <View style={styles.deliveriesContainer}>
            <Text style={styles.sectionTitle}>{i18n.t('home.activeDeliveries')}</Text>
            {activeDeliveries.slice(0, 2).map((order) => (
              <Card key={order._id} containerStyle={styles.deliveryCard}>
                <View style={styles.deliveryHeader}>
                  <Text style={styles.deliveryId}>Commande #{order._id.slice(-6)}</Text>
                  <Text style={[
                    styles.deliveryStatus,
                    { color: getStatusColor(order.status) }
                  ]}>
                    {order.status === 'out_for_delivery' ? i18n.t('driver.onDelivery') : order.status}
                  </Text>
                </View>
                <Text style={styles.deliveryAddress}>
                  📍 {order.delivery?.address || i18n.t('errors.locationError')}
                </Text>
                {order.user && (
                  <Text style={styles.customerInfo}>
                    👤 {order.user.name} - {order.user.phone}
                  </Text>
                )}
                {order.restaurant && (
                  <Text style={styles.restaurantInfo}>
                    🏪 {order.restaurant.name}
                  </Text>
                )}
                <View style={styles.amountSection}>
                  <Text style={styles.amountLabel}>{i18n.t('common.amount')}:</Text>
                  <Text style={styles.amountValue}>{order.totalPrice}{currency.symbol}</Text>
                </View>
                <View style={styles.deliveryActions}>
                  <Button
                    title={i18n.t('driver.orderDelivered')}
                    onPress={() => handleOrderStatusChange(order._id, 'delivered')}
                    loading={localLoading}
                    buttonStyle={styles.deliverButton}
                  />
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Position et Map */}
        <View style={styles.mapContainer}>
          <Text style={styles.sectionTitle}>
            {i18n.t('home.currentLocation')} {nearbyRestaurants.length > 0 && `(${nearbyRestaurants.length} restaurants)`}
          </Text>
          <View style={styles.mapWrapper}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              region={driverLocation}
              showsUserLocation={false}
              showsMyLocationButton={false}
              followsUserLocation={false}
            >
              {/* Marker pour la position du driver */}
              <Marker
                coordinate={{
                  latitude: driverLocation.latitude,
                  longitude: driverLocation.longitude,
                }}
                title="Votre position"
                description="Position du livreur"
                pinColor={colors.primary}
              />

                {/* Markers pour les restaurants proches */}
                {nearbyRestaurants.map((restaurant) => {
                  const lat = parseFloat(restaurant.latitude);
                  const lng = parseFloat(restaurant.longitude);

                  if (isNaN(lat) || isNaN(lng)) return null;

                  const isAvailable = restaurant.isAvailableForDelivery;
                  const rating = restaurant.rating || 0;

                  return (
                    <Marker
                      key={restaurant._id || restaurant.id}
                      coordinate={{
                        latitude: lat,
                        longitude: lng,
                      }}
                      pinColor="transparent"
                    >
                      {/* Icône personnalisée pour le marker */}
                      <View style={[
                        styles.markerContainer,
                        { backgroundColor: isAvailable ? colors.success : colors.warning }
                      ]}>
                        <Icon
                          name={isAvailable ? "restaurant" : "restaurant-menu"}
                          type="material"
                          size={20}
                          color={colors.white}
                        />
                      </View>

                      {/* Callout avec informations détaillées */}
                      <Callout style={styles.calloutContainer}>
                        <View style={styles.calloutContent}>
                          <Text style={styles.calloutTitle}>{restaurant.name}</Text>

                          {/* Rating avec étoiles */}
                          <View style={styles.ratingContainer}>
                            <Icon name="star" type="material" size={14} color={colors.rating} />
                            <Text style={styles.ratingText}>
                              {rating > 0 ? rating.toFixed(1) : 'N/A'}
                            </Text>
                          </View>

                          {/* Distance */}
                          <View style={styles.distanceContainer}>
                            <Icon name="location-on" type="material" size={12} color={colors.text.secondary} />
                            <Text style={styles.distanceText}>
                              {restaurant.distance?.toFixed(1) || 'N/A'} km
                            </Text>
                          </View>

                          {/* Statut de livraison */}
                          <View style={styles.statusContainer}>
                            <Icon
                              name={isAvailable ? "check-circle" : "cancel"}
                              type="material"
                              size={12}
                              color={isAvailable ? colors.success : colors.error}
                            />
                            <Text style={[
                              styles.statusText,
                              { color: isAvailable ? colors.success : colors.error }
                            ]}>
                              {isAvailable ? 'Livraison disponible' : 'Livraison indisponible'}
                            </Text>
                          </View>

                          {/* Adresse (tronquée si trop longue) */}
                          {restaurant.address && (
                            <Text style={styles.addressText} numberOfLines={2}>
                              📍 {restaurant.address.length > 50
                                ? `${restaurant.address.substring(0, 50)}...`
                                : restaurant.address
                              }
                            </Text>
                          )}
                        </View>
                      </Callout>
                    </Marker>
                  );
                })}
              </MapView>

            {/* Loader pour les restaurants */}
            {restaurantsLoading && (
              <View style={styles.mapOverlay}>
                <Loader />
                <Text style={styles.mapOverlayText}>Chargement des restaurants...</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
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
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 15,
  },
  driverImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 2,
    borderColor: colors.white,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  driverId: {
    fontSize: 14,
    color: colors.grey[300],
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: colors.white,
    margin: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.grey[300],
    minWidth: 80,
  },
  statusButtonActive: {
    backgroundColor: colors.primary,
  },
  statusButtonBusy: {
    backgroundColor: colors.driver.busy,
  },
  statusButtonOffline: {
    backgroundColor: colors.driver.offline,
  },
  statusButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 15,
    marginLeft: 20,
  },
  statsContainer: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    margin: 5,
    borderRadius: 12,
    alignItems: 'center',
    padding: 15,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 10,
  },
  statLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 5,
  },
  deliveriesContainer: {
    padding: 20,
  },
  deliveryCard: {
    borderRadius: 12,
    marginBottom: 10,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  deliveryId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  deliveryStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  deliveryAddress: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 15,
  },
  deliveryActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  detailButton: {
    borderColor: colors.primary,
  },
  customerInfo: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 5,
  },
  restaurantInfo: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 5,
  },
  amountSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  amountLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
  },
  deliverButton: {
    backgroundColor: colors.success,
    borderRadius: 8,
    paddingVertical: 10,
  },
  mapContainer: {
    padding: 20,
  },
  mapWrapper: {
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  mapOverlayText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.grey[100],
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 10,
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
    marginBottom: 20,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: colors.white,
  },
  calloutContainer: {
    width: 250,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 0,
  },
  calloutContent: {
    padding: 12,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    color: colors.rating,
    marginLeft: 4,
    fontWeight: '600',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  distanceText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  addressText: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
  },
});
