import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { config } from '../config';
import i18n from '../i18n';
import { DRIVER_LOCATION_TASK } from '../tasks/driverLocationTask';

const getForegroundServiceConfig = () => ({
  notificationTitle: config.APP_NAME,
  notificationBody: i18n.t('driver.backgroundLocationNotificationBody'),
});

const LOCATION_WATCH_OPTIONS = {
  accuracy: Location.Accuracy.Balanced,
  distanceInterval: 50,
  timeInterval: 30000,
};

export const requestDriverLocationPermissions = async () => {
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (foreground.status !== 'granted') {
    return { foreground: false, background: false };
  }

  const background = await Location.requestBackgroundPermissionsAsync();
  return {
    foreground: true,
    background: background.status === 'granted',
  };
};

export const getCurrentDriverCoordinates = async () => {
  const { foreground } = await requestDriverLocationPermissions();
  if (!foreground) {
    return null;
  }

  const position = await Location.getCurrentPositionAsync({});
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
};

export const watchDriverLocation = async (onLocationUpdate) => {
  const { status } = await Location.getForegroundPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  return Location.watchPositionAsync(LOCATION_WATCH_OPTIONS, (position) => {
    onLocationUpdate({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
  });
};

export const startDriverBackgroundLocation = async () => {
  try {
    const isRunning = await Location.hasStartedLocationUpdatesAsync(DRIVER_LOCATION_TASK);
    if (isRunning) {
      return true;
    }

    const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      console.log('📍 [background-setup] Permission foreground manquante');
      return false;
    }

    let { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      const requested = await Location.requestBackgroundPermissionsAsync();
      backgroundStatus = requested.status;
    }

    if (backgroundStatus !== 'granted') {
      console.log(
        '📍 [background-setup] Permission "Toujours" refusée — activer dans Réglages > Localisation'
      );
      return false;
    }

    if (!TaskManager.isTaskDefined(DRIVER_LOCATION_TASK)) {
      console.log('📍 [background-setup] Task background non enregistrée');
      return false;
    }

    await Location.startLocationUpdatesAsync(DRIVER_LOCATION_TASK, {
      ...LOCATION_WATCH_OPTIONS,
      showsBackgroundLocationIndicator: true,
      pausesUpdatesAutomatically: false,
      foregroundService: getForegroundServiceConfig(),
    });

    console.log('📍 [background-setup] Suivi background démarré');
    return true;
  } catch (error) {
    console.log(`📍 [background-setup] Échec démarrage: ${error.message}`);
    return false;
  }
};

export const stopDriverBackgroundLocation = async () => {
  const isRunning = await Location.hasStartedLocationUpdatesAsync(DRIVER_LOCATION_TASK);
  if (isRunning) {
    await Location.stopLocationUpdatesAsync(DRIVER_LOCATION_TASK);
  }
};

export const getDriverLocation = (driver) => {
  return driver?.location?.coordinates ? {
    latitude: driver.location.coordinates[1], 
    longitude: driver.location.coordinates[0], 
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  } : {
    latitude: 48.8566, 
    longitude: 2.3522,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };
};

export const getActiveDeliveries = (deliveries) => {
  return deliveries.filter(delivery => delivery.status === 'out_for_delivery');
};

