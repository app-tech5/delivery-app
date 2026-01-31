import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, ScrollView, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../global';
import { useDriver } from '../contexts/DriverContext';
import { useSettings } from '../contexts/SettingContext';

// Import hooks
import { useNearbyRestaurants, useDriverStatus } from '../hooks';

// Import components
import {
  AuthGuard,
  DriverHeader,
  StatusButtons,
  DriverStats,
  ActiveDeliveries,
  RestaurantMap
} from '../components';

// Import utilities
import { getDriverLocation, getActiveDeliveries } from '../utils';

function HomeScreen() {
  const navigation = useNavigation();
  const { driver, stats, deliveries, loadDriverStats, loadDriverOrders, isAuthenticated } = useDriver();
  const { currency } = useSettings();

  // Hooks personnalisés
  const { isLoading, handleStatusChange, handleOrderStatusChange } = useDriverStatus();

  // Position du driver
  const driverLocation = getDriverLocation(driver);

  // Hook pour les restaurants proches
  const { nearbyRestaurants, restaurantsLoading } = useNearbyRestaurants(driverLocation);

  // Charger les données du driver
  useEffect(() => {
    if (isAuthenticated) {
      loadDriverStats();
      loadDriverOrders();
    }
  }, [isAuthenticated]);

  // Commandes actives (en livraison)
  const activeDeliveries = getActiveDeliveries(deliveries);

  return (
    <SafeAreaView style={styles.container}>
      <AuthGuard
        showLoginButton={true}
        onLoginPress={() => navigation.navigate('Login')}
      />

      {isAuthenticated && driver && (
        <>
          <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

          <ScrollView showsVerticalScrollIndicator={false}>
            <DriverHeader driver={driver} />
            <StatusButtons
              currentStatus={driver.status}
              onStatusChange={handleStatusChange}
              isLoading={isLoading}
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
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
});

export default HomeScreen;
