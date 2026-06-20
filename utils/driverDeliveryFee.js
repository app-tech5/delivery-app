import { getDistanceFromLatLonInKm } from './geoUtils';
import { calculateDriverDeliveryFeeFromSetting } from './deliverySetting';

const deliverySettingsCache = new Map();

function parseCoord(value) {
  if (value == null || value === '') return NaN;
  const n = Number(String(value).trim());
  return Number.isFinite(n) ? n : NaN;
}

export function getRestaurantIdFromOrder(order) {
  const restaurant = order?.restaurant;
  return restaurant?._id || restaurant?.id || restaurant || null;
}

export function getOrderDistanceKm(order) {
  const restLat = parseCoord(order?.restaurant?.latitude);
  const restLon = parseCoord(order?.restaurant?.longitude);
  const userLocation = order?.user?.location;
  const userLat = parseCoord(userLocation?.latitude ?? userLocation?.lat);
  const userLon = parseCoord(userLocation?.longitude ?? userLocation?.lng);

  if (![restLat, restLon, userLat, userLon].every(Number.isFinite)) {
    return null;
  }

  if (userLat === 0 && userLon === 0) {
    return null;
  }

  const distance = getDistanceFromLatLonInKm(userLat, userLon, restLat, restLon);
  if (!Number.isFinite(distance)) {
    return null;
  }

  return Math.round(distance * 10) / 10;
}

export function getDriverDeliveryEarnings(order) {
  if (order?.delivery?.type === 'pickup') {
    return 0;
  }

  const restaurantId = getRestaurantIdFromOrder(order);
  const setting = restaurantId
    ? deliverySettingsCache.get(String(restaurantId))
    : null;
  if (!setting) {
    return 0;
  }

  const distanceKm = getOrderDistanceKm(order);

  return (
    calculateDriverDeliveryFeeFromSetting(
      setting,
      distanceKm,
      order?.delivery?.type || 'delivery',
    ) ?? 0
  );
}

export async function preloadDeliverySettingsForOrders(orders = []) {
  const restaurantIds = [
    ...new Set(
      orders
        .map(getRestaurantIdFromOrder)
        .filter(Boolean)
        .map((id) => String(id))
    ),
  ];

  await Promise.all(
    restaurantIds.map(async (restaurantId) => {
      if (deliverySettingsCache.has(restaurantId)) {
        return;
      }

      const { default: apiClient } = await import('../api');
      const setting = await apiClient.getRestaurantDeliverySettings(restaurantId);
      if (setting) {
        deliverySettingsCache.set(restaurantId, setting);
      }
    })
  );
}

export function clearDeliverySettingsCache() {
  deliverySettingsCache.clear();
}
