import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from '@maplibre/maplibre-react-native';
import { Ionicons } from '@expo/vector-icons';
import DriverCarTopIcon from './DriverCarTopIcon';
import {
  bearing,
  bearingAlongPolylineNearPoint,
  getDistanceFromLatLonInKm,
  getGeoJsonPointFromSocketPayload,
} from '../../utils/geoUtils';

const DRIVER_ICON_SIZE = 36;
const ICON_RING_SIZE = 40;
const MOTION_MIN_KM = 1e-5;

const KIND_DEFAULTS = {
  driver: { icon: 'car-outline', color: '#2563eb' },
  customer: { icon: 'home-outline', color: '#16a34a' },
  restaurant: { icon: 'restaurant-outline', color: '#ea580c' },
};

const MapMarkerCalloutContext = createContext(null);

export function MapMarkerCalloutScope({ children }) {
  const [activeId, setActiveId] = useState(null);

  const toggleMarkerId = useCallback((markerId) => {
    setActiveId((prev) => (prev === markerId ? null : markerId));
  }, []);

  const clearIfActive = useCallback((markerId) => {
    setActiveId((prev) => (prev === markerId ? null : prev));
  }, []);

  const value = useMemo(
    () => ({ activeId, toggleMarkerId, clearIfActive }),
    [activeId, toggleMarkerId, clearIfActive]
  );

  return (
    <MapMarkerCalloutContext.Provider value={value}>{children}</MapMarkerCalloutContext.Provider>
  );
}

export function useMapMarkerCallout() {
  return useContext(MapMarkerCalloutContext);
}

export function MapEntityMarker({
  latitude,
  longitude,
  id,
  kind = 'customer',
  iconName,
  iconColor,
  anchor = 'bottom',
  socket,
  trackingOrderId,
  routePolyline,
  headingFallbackPoint,
}) {
  const scope = useContext(MapMarkerCalloutContext);
  const [liveDriverPoint, setLiveDriverPoint] = useState(null);
  const [driverHeadingDeg, setDriverHeadingDeg] = useState(0);
  const prevDriverForHeadingRef = useRef(null);
  const isSelected = scope?.activeId === id;

  const handleMarkerPress = () => {
    scope?.toggleMarkerId(id);
  };

  const clearIfActive = scope?.clearIfActive;
  useEffect(() => {
    clearIfActive?.(id);
  }, [latitude, longitude, id, clearIfActive]);

  useEffect(() => {
    setLiveDriverPoint(null);
    prevDriverForHeadingRef.current = null;
  }, [trackingOrderId, latitude, longitude]);

  useEffect(() => {
    if (kind !== 'driver' || !socket || !trackingOrderId) return;

    socket.emit('joinOrderTrackingRoom', trackingOrderId);

    const onDriverLocationUpdated = (data) => {
      const next = getGeoJsonPointFromSocketPayload(data);
      if (!next || !Array.isArray(next.coordinates) || next.coordinates.length < 2) return;
      const [lng, lat] = next.coordinates;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      setLiveDriverPoint({ latitude: lat, longitude: lng });
    };

    socket.on('driver-location-updated', onDriverLocationUpdated);

    return () => {
      socket.off('driver-location-updated', onDriverLocationUpdated);
    };
  }, [kind, socket, trackingOrderId]);

  const preset = KIND_DEFAULTS[kind] || KIND_DEFAULTS.customer;
  const resolvedIcon = iconName || preset.icon;
  const resolvedColor = iconColor || preset.color;

  const effectiveLat = liveDriverPoint?.latitude ?? latitude;
  const effectiveLng = liveDriverPoint?.longitude ?? longitude;
  const lngLat = [effectiveLng, effectiveLat];

  useEffect(() => {
    if (kind !== 'driver') return;
    if (!Number.isFinite(effectiveLat) || !Number.isFinite(effectiveLng)) return;

    const fromRoute = bearingAlongPolylineNearPoint(effectiveLat, effectiveLng, routePolyline);
    if (fromRoute != null) {
      setDriverHeadingDeg(fromRoute);
      prevDriverForHeadingRef.current = { latitude: effectiveLat, longitude: effectiveLng };
      return;
    }

    const fb = headingFallbackPoint;
    if (fb && Number.isFinite(fb.latitude) && Number.isFinite(fb.longitude)) {
      setDriverHeadingDeg(bearing(effectiveLat, effectiveLng, fb.latitude, fb.longitude));
      prevDriverForHeadingRef.current = { latitude: effectiveLat, longitude: effectiveLng };
      return;
    }

    const prev = prevDriverForHeadingRef.current;
    if (
      prev &&
      Number.isFinite(prev.latitude) &&
      Number.isFinite(prev.longitude) &&
      (prev.latitude !== effectiveLat || prev.longitude !== effectiveLng)
    ) {
      const movedKm = getDistanceFromLatLonInKm(
        prev.latitude,
        prev.longitude,
        effectiveLat,
        effectiveLng
      );
      if (movedKm != null && movedKm >= MOTION_MIN_KM) {
        setDriverHeadingDeg(bearing(prev.latitude, prev.longitude, effectiveLat, effectiveLng));
      }
    }

    prevDriverForHeadingRef.current = { latitude: effectiveLat, longitude: effectiveLng };
  }, [kind, effectiveLat, effectiveLng, routePolyline, headingFallbackPoint]);

  const isDriverCar = kind === 'driver' && !iconName;

  return (
    <Marker
      lngLat={lngLat}
      id={id}
      anchor={anchor}
      onPress={handleMarkerPress}
    >
      <View style={styles.markerRoot} collapsable={false}>
        {isDriverCar ? (
          <View
            style={[
              styles.driverMarkerWrap,
              { transform: [{ rotate: `${driverHeadingDeg}deg` }] },
            ]}
          >
            <DriverCarTopIcon size={DRIVER_ICON_SIZE} color={resolvedColor} />
          </View>
        ) : (
          <View
            style={[
              styles.iconRing,
              isSelected && styles.iconRingSelected,
              { borderColor: resolvedColor },
            ]}
          >
            <Ionicons name={resolvedIcon} size={22} color={resolvedColor} />
          </View>
        )}
      </View>
    </Marker>
  );
}

export default MapEntityMarker;

const styles = StyleSheet.create({
  markerRoot: {
    alignItems: 'center',
  },
  driverMarkerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconRing: {
    width: ICON_RING_SIZE,
    height: ICON_RING_SIZE,
    borderRadius: ICON_RING_SIZE / 2,
    borderWidth: 2,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2,
    elevation: 3,
  },
  iconRingSelected: {
    borderWidth: 3,
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 5,
  },
});
