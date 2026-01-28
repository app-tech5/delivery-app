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
// import MapView, { Marker } from 'react-native-maps'; // Temporairement désactivé
import { colors } from '../global';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  // État séparé pour le statut pour forcer les re-renders
  const [driverStatus, setDriverStatus] = useState('available');

  // Données mockées pour démonstration
  const driver = {
    userId: { name: 'Jean Dupont', email: 'jean@example.com' },
    licenseNumber: '123456789',
    status: driverStatus, // Utilise l'état séparé
    vehicle: {
      type: 'scooter',
      model: 'Honda PCX',
      licensePlate: 'AB-123-CD'
    }
  };

  const [stats] = useState({
    todayDeliveries: 5,
    totalEarnings: 45.50,
    rating: 4.8,
    completedOrders: 127
  });

  const [deliveries] = useState([
    {
      _id: '1',
      orderId: 'ORD-001',
      status: 'accepted',
      deliveryAddress: '15 Rue de la Paix, Paris',
      customerPhone: '+33123456789',
      totalAmount: 25.90
    }
  ]);

  const [currentLocation, setCurrentLocation] = useState({
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Gestionnaire de changement de statut
  // const handleStatusChange = (newStatus) => {
  //   console.log('Changement de statut vers:', newStatus);
  //   console.log('Statut actuel:', driverStatus);

  //   // Mettre à jour le statut
  //   setDriverStatus(newStatus);

  //   Alert.alert('Succès', `Statut mis à jour: ${getStatusLabel(newStatus)}`);
  // };

  // Changer le statut du driver
  const handleStatusChange = async (newStatus) => {
    try {
      setIsLoading(true);

      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mettre à jour le statut localement
      setDriverStatus(newStatus);

      Alert.alert('Succès', `Statut mis à jour: ${getStatusLabel(newStatus)}`);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut');
    } finally {
      setIsLoading(false);
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

  // Livraisons actives
  const activeDeliveries = deliveries.filter(delivery =>
    delivery.status === 'accepted' || delivery.status === 'picked_up'
  );


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
            {activeDeliveries.slice(0, 2).map((delivery) => (
              <Card key={delivery._id} containerStyle={styles.deliveryCard}>
                <View style={styles.deliveryHeader}>
                  <Text style={styles.deliveryId}>Commande #{delivery.orderId}</Text>
                  <Text style={[
                    styles.deliveryStatus,
                    { color: getStatusColor(delivery.status) }
                  ]}>
                    {delivery.status === 'accepted' ? 'Acceptée' : 'Récupérée'}
                  </Text>
                </View>
                <Text style={styles.deliveryAddress}>
                  📍 {delivery.deliveryAddress}
                </Text>
                <View style={styles.deliveryActions}>
                  <Button
                    title="Voir détails"
                    type="outline"
                    onPress={() => Alert.alert('Info', 'Voir les détails de la livraison')}
                    buttonStyle={styles.detailButton}
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
});
