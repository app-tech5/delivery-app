import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import { colors } from '../global';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';

// Import hooks
import { useNearbyRestaurants, useDriverStatus } from '../hooks';

// Import components
import {
  AuthGuard,
  ScreenLayout,
  StatusButtons,
  DriverStats,
  ActiveDeliveries,
  RestaurantMap
} from '../components';

// Import utilities
import { getDriverLocation, getActiveDeliveries, getStatusColor } from '../utils';

function HomeScreen() {
  const navigation = useNavigation();
  const {
    driver,
    stats,
    deliveries,
    loadDriverStats,
    loadDriverOrders,
    hasCompletedOnboarding,
    isAuthenticated,
  } = useDriver();
  const { currency } = useSettings();

  // Hooks personnalisés
  const { isLoading, handleStatusChange, handleOrderStatusChange } = useDriverStatus();

  // Position du driver
  const driverLocation = getDriverLocation(driver);

  // Hook pour les restaurants proches
  const { nearbyRestaurants, restaurantsLoading } = useNearbyRestaurants(driverLocation);

  // Charger les données du driver
  useEffect(() => {
    if (hasCompletedOnboarding) {
      loadDriverStats();
      loadDriverOrders();
    }
  }, [hasCompletedOnboarding]);

  // Commandes actives (en livraison)
  const activeDeliveries = getActiveDeliveries(deliveries);

  return (
    <View style={styles.root}>
      <AuthGuard
        isAuthenticated={isAuthenticated}
        driver={driver}
        showLoginButton={true}
        onLoginPress={() => navigation.navigate('Login')}
      />

      {hasCompletedOnboarding && driver && (
        <ScreenLayout
          testID="home-screen"
          title={driver?.userId?.name || 'Driver'}
          subtitle={`ID: ${driver?.licenseNumber || 'N/A'}`}
          headerContainerStyle={styles.headerContainer}
          leftComponent={
            driver?.userId?.image ? (
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
            )
          }
          rightComponent={
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: getStatusColor(driver?.status, 'driver') }
                ]}
              />
              <Text style={styles.statusText} testID="driver-status-badge">
                {driver?.status || 'unknown'}
              </Text>
            </View>
          }
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <StatusButtons
              currentStatus={driver.status}
              onStatusChange={handleStatusChange}
              isLoading={isLoading}
              isApproved={Boolean(driver.isApproved)}
            />
            <DriverStats stats={stats} currency={currency} />
            <ActiveDeliveries
              deliveries={activeDeliveries}
              currency={currency}
              onOrderDelivered={handleOrderStatusChange}
              isLoading={isLoading}
            />
            <RestaurantMap
              driverLocation={driverLocation}
              nearbyRestaurants={nearbyRestaurants}
              restaurantsLoading={restaurantsLoading}
            />
          </ScrollView>
        </ScreenLayout>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  headerContainer: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatar: {
    marginRight: 0,
  },
  driverImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.white,
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
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeScreen;
