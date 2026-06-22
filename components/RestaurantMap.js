import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../global';
import { LoadingOverlay } from './index';
import DriverNearbyMap from './map/DriverNearbyMap';
import MapSelectionPanel from './map/MapSelectionPanel';
import { MapMarkerCalloutScope } from './map/MapEntityMarker';
import { truncateText } from '../utils';
import i18n from '../i18n';

const RestaurantMap = ({ driverLocation, nearbyRestaurants, restaurantsLoading }) => {
  const getRestaurantCallout = useCallback((restaurant) => {
    const parts = [];
    if (restaurant.distance != null) {
      parts.push(`${restaurant.distance.toFixed(1)} km`);
    }
    parts.push(
      restaurant.isAvailableForDelivery
        ? i18n.t('home.deliveryAvailable')
        : i18n.t('home.deliveryUnavailable')
    );
    if (restaurant.address) {
      parts.push(truncateText(restaurant.address, 40));
    }

    return {
      title: restaurant.name,
      subtitle: parts.join(' · '),
    };
  }, []);

  const resolveCallout = useCallback(
    (markerId) => {
      if (markerId === 'home-driver') {
        return {
          title: i18n.t('home.mapMarkerDriver'),
          subtitle: i18n.t('home.mapMarkerDriverSubtitle'),
        };
      }

      if (!markerId?.startsWith('restaurant-')) {
        return null;
      }

      const restaurantId = markerId.slice('restaurant-'.length);
      const restaurant = nearbyRestaurants.find(
        (item) => String(item._id || item.id) === restaurantId
      );

      return restaurant ? getRestaurantCallout(restaurant) : null;
    },
    [nearbyRestaurants, getRestaurantCallout]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        {i18n.t('home.currentLocation')}
        {nearbyRestaurants.length > 0 && ` (${nearbyRestaurants.length})`}
      </Text>

      <MapMarkerCalloutScope>
        <MapSelectionPanel resolveCallout={resolveCallout} />
        <View style={styles.mapWrapper}>
          <DriverNearbyMap
            driverLocation={driverLocation}
            nearbyRestaurants={nearbyRestaurants}
            style={styles.map}
          />
          <LoadingOverlay
            visible={restaurantsLoading}
            text={i18n.t('home.loadingRestaurants')}
          />
        </View>
      </MapMarkerCalloutScope>
    </View>
  );
};

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
});

export default RestaurantMap;
