import * as TaskManager from 'expo-task-manager';
import apiClient from '../api';

export const DRIVER_LOCATION_TASK = 'driver-background-location';

const LOCATION_UPDATE_INTERVAL_MS = 30000;

let lastSentAt = 0;
let inFlight = false;

TaskManager.defineTask(DRIVER_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }

  const locations = data?.locations;
  if (!locations?.length) return;

  const position = locations[locations.length - 1];
  const coords = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };

  const now = Date.now();
  if (inFlight || now - lastSentAt < LOCATION_UPDATE_INTERVAL_MS) return;

  inFlight = true;
  try {
    await apiClient.initializeFromStorage();
    const driverId = apiClient.driver?._id || apiClient.driver?.id;
    if (!driverId) {
      console.log('📍 [background-setup] Pas de driver en session');
      return;
    }

    await apiClient.updateDriverLocation(coords, 'background');
    lastSentAt = Date.now();
  } catch (err) {
    console.error('Background location update error:', err);
  } finally {
    inFlight = false;
  }
});
