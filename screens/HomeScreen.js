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
  Dimensions
} from 'react-native';
import { Icon, Card, Button } from 'react-native-elements';
import Loader from './Loader';
// import MapView, { Marker } from 'react-native-maps'; // Temporairement désactivé
import { colors } from '../global';
import { useDriver } from '../contexts/DriverContext';

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

  const [currentLocation, setCurrentLocation] = useState({
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [localLoading, setLocalLoading] = useState(false);
  const isLoading = contextLoading || localLoading;

  // Charger les données au montage du composant
  useEffect(() => {
    if (isAuthenticated) {
      loadDriverStats();
      loadDriverOrders();
    }
  }, [isAuthenticated]);

  // Gestionnaire de changement de statut du driver
  const handleStatusChange = async (newStatus) => {
    if (isLoading) return;

    setLocalLoading(true);

    try {
      await updateStatus(newStatus, currentLocation ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude
      } : null);

      Alert.alert('Succès', `Statut mis à jour: ${getStatusLabel(newStatus)}`);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut');
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
      Alert.alert('Succès', `Commande ${newStatus === 'delivered' ? 'livrée' : 'mise à jour'}`);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour la commande');
    } finally {
      setLocalLoading(false);
    }
  };

  // Obtenir le label du statut
  const getStatusLabel = (status) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'on_delivery': return 'En livraison';
      case 'offline': return 'Hors ligne';
      case 'busy': return 'Occupé';
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
          <Text style={styles.title}>Veuillez vous reconnecter</Text>
          <Button
            title="Se reconnecter"
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
              <Icon
                name="person"
                type="material"
                size={40}
                color={colors.white}
                containerStyle={styles.avatar}
              />
              <View>
                <Text style={styles.driverName}>
                  {driver?.userId?.name || 'Livreur'}
                </Text>
                <Text style={styles.driverId}>
                  ID: {driver?.licenseNumber || 'N/A'}
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
            <Text style={styles.statusButtonText}>Disponible</Text>
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
            <Text style={styles.statusButtonText}>Occupé</Text>
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
            <Text style={styles.statusButtonText}>Hors ligne</Text>
          </TouchableOpacity>
        </View>

        {/* Statistiques */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Statistiques du jour</Text>
          <View style={styles.statsGrid}>
            <Card containerStyle={styles.statCard}>
              <Icon name="local-shipping" type="material" size={30} color={colors.primary} />
              <Text style={styles.statNumber}>{stats.todayDeliveries || 0}</Text>
              <Text style={styles.statLabel}>Livraisons</Text>
            </Card>

            <Card containerStyle={styles.statCard}>
              <Icon name="euro" type="material" size={30} color={colors.success} />
              <Text style={styles.statNumber}>{stats.totalEarnings || 0}€</Text>
              <Text style={styles.statLabel}>Revenus</Text>
            </Card>

            <Card containerStyle={styles.statCard}>
              <Icon name="star" type="material" size={30} color={colors.rating} />
              <Text style={styles.statNumber}>{stats.rating || 0}</Text>
              <Text style={styles.statLabel}>Note</Text>
            </Card>
          </View>
        </View>

        {/* Livraisons actives */}
        {activeDeliveries.length > 0 && (
          <View style={styles.deliveriesContainer}>
            <Text style={styles.sectionTitle}>Livraisons en cours</Text>
            {activeDeliveries.slice(0, 2).map((order) => (
              <Card key={order._id} containerStyle={styles.deliveryCard}>
                <View style={styles.deliveryHeader}>
                  <Text style={styles.deliveryId}>Commande #{order._id.slice(-6)}</Text>
                  <Text style={[
                    styles.deliveryStatus,
                    { color: getStatusColor(order.status) }
                  ]}>
                    {order.status === 'out_for_delivery' ? 'En livraison' : order.status}
                  </Text>
                </View>
                <Text style={styles.deliveryAddress}>
                  📍 {order.delivery?.address || 'Adresse non disponible'}
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
                  <Text style={styles.amountLabel}>Montant:</Text>
                  <Text style={styles.amountValue}>{order.totalPrice}€</Text>
                </View>
                <View style={styles.deliveryActions}>
                  <Button
                    title="Marquer comme livré"
                    onPress={() => handleOrderStatusChange(order._id, 'delivered')}
                    loading={localLoading}
                    buttonStyle={styles.deliverButton}
                  />
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Position */}
        <View style={styles.mapContainer}>
          <Text style={styles.sectionTitle}>Votre position</Text>
          <View style={styles.mapWrapper}>
            <View style={styles.mapPlaceholder}>
              <Icon name="location-on" type="material" size={50} color={colors.primary} />
              <Text style={styles.mapPlaceholderText}>
                Position: {currentLocation ? `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}` : 'Non disponible'}
              </Text>
              <Text style={styles.mapPlaceholderSubtext}>
                Mise à jour en temps réel
              </Text>
            </View>
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
    height: 200,
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
});
