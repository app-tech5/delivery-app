import { Alert, Linking } from 'react-native';
import i18n from '../i18n';
import { getPointFromLocation } from './geoUtils';

const normalizeLocation = (location) => {
  if (typeof location === 'string') {
    return location.trim();
  }

  if (!location || typeof location !== 'object') {
    return '';
  }

  const point = getPointFromLocation(location);
  if (point) {
    return `${point.latitude},${point.longitude}`;
  }

  const latitude = parseFloat(location.latitude);
  const longitude = parseFloat(location.longitude);
  if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
    return `${latitude},${longitude}`;
  }

  return location.address?.trim() || '';
};

export const buildMapsDirectionsUrl = (
  destination,
  { origin = null, travelMode = 'driving' } = {}
) => {
  const normalizedDestination = normalizeLocation(destination);
  const normalizedOrigin = normalizeLocation(origin);
  const params = new URLSearchParams({
    api: '1',
    destination: normalizedDestination,
    travelmode: travelMode,
  });

  if (normalizedOrigin) {
    params.set('origin', normalizedOrigin);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
};

export const openMapsNavigation = async ({
  destination,
  origin = null,
  requireOrigin = false,
} = {}) => {
  const normalizedDestination = normalizeLocation(destination);
  if (!normalizedDestination) {
    Alert.alert(i18n.t('common.error'), i18n.t('reports.addressNotAvailable'));
    return;
  }

  const normalizedOrigin = normalizeLocation(origin);
  if (requireOrigin && !normalizedOrigin) {
    Alert.alert(i18n.t('common.error'), i18n.t('orderDetails.driverLocationNotAvailable'));
    return;
  }

  const url = buildMapsDirectionsUrl(destination, { origin });

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      return;
    }

    Alert.alert(i18n.t('common.error'), i18n.t('orderDetails.mapsNotAvailable'));
  } catch (error) {
    console.error('Failed to open maps navigation:', error);
    Alert.alert(i18n.t('common.error'), i18n.t('orderDetails.mapsNotAvailable'));
  }
};
