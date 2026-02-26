import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Icon } from 'react-native-elements';
import { colors } from '../global';
import { LoadingOverlay } from './index';
import { truncateText } from '../utils';
import i18n from '../i18n';

const RestaurantMarker = ({ restaurant }) => {
  const lat = parseFloat(restaurant.latitude);
  const lng = parseFloat(restaurant.longitude);

  if (isNaN(lat) || isNaN(lng)) return null;

  const isAvailable = restaurant.isAvailableForDelivery;
  const rating = restaurant.rating || 0;

  return (
    <Marker
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
              📍 {truncateText(restaurant.address, 50)}
            </Text>
          )}
        </View>
      </Callout>
    </Marker>
  );
};

const RestaurantMap = ({ driverLocation, nearbyRestaurants, restaurantsLoading }) => {
  return (
    <View style={styles.container}>
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
          {nearbyRestaurants.map((restaurant) => (
            <RestaurantMarker key={restaurant._id || restaurant.id} restaurant={restaurant} />
          ))}
        </MapView>

        {/* Loader pour les restaurants */}
        <LoadingOverlay
          visible={restaurantsLoading}
          text="Chargement des restaurants..."
        />
      </View>
    </View>
  );
};

// Importer PROVIDER_GOOGLE depuis react-native-maps
import { PROVIDER_GOOGLE } from 'react-native-maps';

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 15,
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

export default RestaurantMap;


