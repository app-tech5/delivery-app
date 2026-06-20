import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { config } from '../config';
import i18n from '../i18n';
import apiClient from '../api';
import { isDemoDriverAccount } from './demoDriverUtils';
import { getPointFromLocation } from './geoUtils';
import { DRIVER_LOCATION_TASK } from '../tasks/driverLocationTask';

export const shouldUseDeviceLocation = (user = apiClient.user, driver = apiClient.driver) =>
  !isDemoDriverAccount(user, driver);

export const getDriverCoordinatesPoint = (driver) => getPointFromLocation(driver?.location);

const getForegroundServiceConfig = () => ({
  notificationTitle: config.APP_NAME,
  notificationBody: i18n.t('driver.backgroundLocationNotificationBody'),
});

const LOCATION_WATCH_OPTIONS = {
  accuracy: Location.Accuracy.Balanced,
  distanceInterval: 50,
  timeInterval: 30000,
};

export const requestDriverLocationPermissions = (user = apiClient.user, driver = apiClient.driver) => {
  if (!shouldUseDeviceLocation(user, driver)) {
    return Promise.resolve({ foreground: true, background: false });
  }

  return (async () => {
    const foreground = await Location.requestForegroundPermissionsAsync();
    if (foreground.status !== 'granted') {
      return { foreground: false, background: false };
    }

    const background = await Location.requestBackgroundPermissionsAsync();
    return {
      foreground: true,
      background: background.status === 'granted',
    };
  })();
};

export const getCurrentDriverCoordinates = async (user = apiClient.user, driver = apiClient.driver) => {
  if (!shouldUseDeviceLocation(user, driver)) {
    return null;
  }

  const { foreground } = await requestDriverLocationPermissions(user, driver);
  if (!foreground) {
    return null;
  }

  const position = await Location.getCurrentPositionAsync({});
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
};

export const watchDriverLocation = async (
  onLocationUpdate,
  user = apiClient.user,
  driver = apiClient.driver
) => {
  if (!shouldUseDeviceLocation(user, driver)) {
    return null;
  }

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

export const startDriverBackgroundLocation = async (user = apiClient.user, driver = apiClient.driver) => {
  if (!shouldUseDeviceLocation(user, driver)) {
    return false;
  }

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

export const getDriverLocation = (driver, user = apiClient.user) => {
  const point = getDriverCoordinatesPoint(driver);
  if (point) {
    return {
      ...point,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  if (isDemoDriverAccount(user, driver)) {
    return null;
  }

  return {
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };
};

export const getActiveDeliveries = (deliveries) => {
  return deliveries.filter(
    (delivery) =>
      delivery?.status === 'out_for_delivery' &&
      delivery?.delivery?.type !== 'pickup'
  );
};
