import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../global';
import { LoadingOverlay } from './index';
import DriverNearbyMap from './map/DriverNearbyMap';
import { truncateText } from '../utils';
import i18n from '../i18n';

const RestaurantMap = ({ driverLocation, nearbyRestaurants, restaurantsLoading }) => {
  const getRestaurantCallout = (restaurant) => {
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
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        {i18n.t('home.currentLocation')}
        {nearbyRestaurants.length > 0 && ` (${nearbyRestaurants.length})`}
      </Text>
      <View style={styles.mapWrapper}>
        <DriverNearbyMap
          driverLocation={driverLocation}
          nearbyRestaurants={nearbyRestaurants}
          driverCalloutTitle={i18n.t('home.mapMarkerDriver')}
          driverCalloutSubtitle={i18n.t('home.mapMarkerDriverSubtitle')}
          getRestaurantCallout={getRestaurantCallout}
          style={styles.map}
        />
        <LoadingOverlay
          visible={restaurantsLoading}
          text={i18n.t('home.loadingRestaurants')}
        />
      </View>
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
