import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Camera, Map } from '@maplibre/maplibre-react-native';
import MapEntityMarker, { MapMarkerCalloutScope } from './MapEntityMarker';
import { getPointFromLocation } from '../../utils/geoUtils';

const FIT_PADDING = { top: 48, right: 48, bottom: 48, left: 48 };
const DEFAULT_ZOOM = 13;
const FALLBACK_STYLE_URL = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

const getRestaurantPoint = (restaurant) => {
  const lat = parseFloat(restaurant?.latitude);
  const lng = parseFloat(restaurant?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { latitude: lat, longitude: lng };
};

/**
 * Carte MapLibre (même stack que customer-app OrderTracking) : driver + restaurants proches.
 */
export default function DriverNearbyMap({
  driverLocation,
  nearbyRestaurants = [],
  driverCalloutTitle,
  driverCalloutSubtitle,
  getRestaurantCallout,
  style,
}) {
  const cameraRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const driverPoint = useMemo(() => getPointFromLocation(driverLocation), [driverLocation]);

  const restaurantPoints = useMemo(
    () =>
      (nearbyRestaurants || [])
        .map((restaurant) => ({
          restaurant,
          point: getRestaurantPoint(restaurant),
        }))
        .filter((entry) => entry.point),
    [nearbyRestaurants]
  );

  const initialCenter = useMemo(() => {
    if (driverPoint) return [driverPoint.longitude, driverPoint.latitude];
    const first = restaurantPoints[0]?.point;
    if (first) return [first.longitude, first.latitude];
    return [2.3522, 48.8566];
  }, [driverPoint, restaurantPoints]);

  useEffect(() => {
    if (!isMapReady) return;
    const camera = cameraRef.current;
    if (!camera) return;

    const points = [
      ...(driverPoint ? [driverPoint] : []),
      ...restaurantPoints.map((entry) => entry.point),
    ];

    if (points.length === 0) return;

    if (points.length === 1) {
      const only = points[0];
      camera.setStop({
        center: [only.longitude, only.latitude],
        zoom: DEFAULT_ZOOM,
        duration: 250,
      });
      return;
    }

    const lngs = points.map((p) => p.longitude);
    const lats = points.map((p) => p.latitude);
    const west = Math.min(...lngs);
    const east = Math.max(...lngs);
    const south = Math.min(...lats);
    const north = Math.max(...lats);

    camera.fitBounds([west, south, east, north], { padding: FIT_PADDING, duration: 500 });
  }, [driverPoint, restaurantPoints, isMapReady]);

  return (
    <View style={style}>
      <Map
        style={StyleSheet.absoluteFill}
        mapStyle={FALLBACK_STYLE_URL}
        onDidFinishLoadingMap={() => setIsMapReady(true)}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: initialCenter,
            zoom: DEFAULT_ZOOM,
          }}
        />
        <MapMarkerCalloutScope>
          {driverPoint && (
            <MapEntityMarker
              id="home-driver"
              kind="driver"
              latitude={driverPoint.latitude}
              longitude={driverPoint.longitude}
              anchor="center"
              calloutTitle={driverCalloutTitle}
              calloutSubtitle={driverCalloutSubtitle}
            />
          )}
          {restaurantPoints.map(({ restaurant, point }) => {
            const callout = getRestaurantCallout?.(restaurant) || {};
            return (
              <MapEntityMarker
                key={restaurant._id || restaurant.id}
                id={`restaurant-${restaurant._id || restaurant.id}`}
                kind="restaurant"
                latitude={point.latitude}
                longitude={point.longitude}
                calloutTitle={callout.title}
                calloutSubtitle={callout.subtitle}
              />
            );
          })}
        </MapMarkerCalloutScope>
      </Map>
    </View>
  );
}
