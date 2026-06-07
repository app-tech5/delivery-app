import { useEffect, useRef } from 'react';
import apiClient from '../api';
import {
  watchDriverLocation,
  requestDriverLocationPermissions,
  startDriverBackgroundLocation,
  stopDriverBackgroundLocation,
} from '../utils/locationUtils';
import { isDriverOnline, isDriverApproved } from '../utils/statusUtils';

const LOCATION_UPDATE_INTERVAL_MS = 30000;

/**
 * Envoie la position GPS au serveur tant que le driver est en ligne (available, busy, …).
 */
export const useDriverLocationWatch = (driver, hasCompletedOnboarding, setDriver) => {
  const subscriptionRef = useRef(null);
  const inFlightRef = useRef(false);
  const lastSentAtRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const stopWatch = () => {
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };

    const stopAll = async () => {
      stopWatch();
      await stopDriverBackgroundLocation();
    };

    if (
      !hasCompletedOnboarding ||
      !driver?._id ||
      !isDriverApproved(driver) ||
      !isDriverOnline(driver.status)
    ) {
      stopAll();
      return () => {
        cancelled = true;
        stopAll();
      };
    }

    const sendLocation = async (coords) => {
      if (cancelled || inFlightRef.current) return;

      const now = Date.now();
      if (now - lastSentAtRef.current < LOCATION_UPDATE_INTERVAL_MS) return;

      inFlightRef.current = true;
      try {
        const updatedDriver = await apiClient.updateDriverLocation(coords, 'foreground');
        lastSentAtRef.current = Date.now();
        if (!cancelled && updatedDriver) {
          setDriver(updatedDriver);
        }
      } catch (error) {
        console.error('Driver location watch error:', error);
      } finally {
        inFlightRef.current = false;
      }
    };

    const startWatch = async () => {
      if (subscriptionRef.current) return;

      await requestDriverLocationPermissions();

      const subscription = await watchDriverLocation((coords) => {
        sendLocation(coords);
      });

      if (!cancelled && subscription) {
        subscriptionRef.current = subscription;
      }

      await startDriverBackgroundLocation();
    };

    startWatch();

    return () => {
      cancelled = true;
      stopAll();
    };
  }, [driver?._id, driver?.status, hasCompletedOnboarding, setDriver]);
};
