import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { getPointFromLocation } from '../../utils/geoUtils';

const DEFAULT_ZOOM = 13;

const getRestaurantPoint = (restaurant) => {
  const lat = parseFloat(restaurant?.latitude);
  const lng = parseFloat(restaurant?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { latitude: lat, longitude: lng };
};

const buildMapHtml = (center, markers) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { margin:0; padding:0; width:100%; height:100%; background:#eef1f5; }
    .leaflet-control-attribution { font-size:10px; }
    .pin {
      width:34px; height:34px; border-radius:17px; background:#fff;
      border:2px solid rgba(0,0,0,.12); box-shadow:0 2px 8px rgba(0,0,0,.22);
      display:flex; align-items:center; justify-content:center; font-size:16px;
    }
    .pin.driver { background:#2563eb; border-color:#fff; color:#fff; }
    .pin.restaurant { background:#fff; color:#ea580c; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const center = ${JSON.stringify(center)};
    const initialMarkers = ${JSON.stringify(markers)};
    const map = L.map('map', { zoomControl: true }).setView(center, ${DEFAULT_ZOOM});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    const layer = L.layerGroup().addTo(map);

    const iconFor = (kind) => L.divIcon({
      className: '',
      html: '<div class="pin ' + (kind || '') + '">' + (kind === 'driver' ? '🚗' : '🍽️') + '</div>',
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    function renderMarkers(list) {
      layer.clearLayers();
      const bounds = [];
      (list || []).forEach((m) => {
        if (!Number.isFinite(m.lat) || !Number.isFinite(m.lng)) return;
        const marker = L.marker([m.lat, m.lng], { icon: iconFor(m.kind) });
        if (m.title) marker.bindPopup('<strong>' + m.title + '</strong>' + (m.subtitle ? '<br/>' + m.subtitle : ''));
        marker.addTo(layer);
        bounds.push([m.lat, m.lng]);
      });
      if (bounds.length === 1) map.setView(bounds[0], ${DEFAULT_ZOOM});
      else if (bounds.length > 1) map.fitBounds(bounds, { padding: [28, 28] });
      setTimeout(() => map.invalidateSize(), 50);
    }

    renderMarkers(initialMarkers);
    window.__updateDriverMap = function (payload) {
      if (!payload) return;
      if (payload.center) map.setView(payload.center, payload.zoom || map.getZoom());
      if (payload.markers) renderMarkers(payload.markers);
      setTimeout(() => map.invalidateSize(), 50);
    };
    setTimeout(() => map.invalidateSize(), 100);
  </script>
</body>
</html>`;

/**
 * Web map for driver home — MapLibre native stub is empty Views on web.
 * Uses Leaflet + OSM tiles in an iframe (same approach as customer-app).
 */
export default function DriverNearbyMap({
  driverLocation,
  nearbyRestaurants = [],
  style,
}) {
  const iframeRef = useRef(null);

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

  const center = useMemo(() => {
    if (driverPoint) return [driverPoint.latitude, driverPoint.longitude];
    const first = restaurantPoints[0]?.point;
    if (first) return [first.latitude, first.longitude];
    return [48.8566, 2.3522];
  }, [driverPoint, restaurantPoints]);

  const markers = useMemo(() => {
    const list = [];
    if (driverPoint) {
      list.push({
        id: 'home-driver',
        kind: 'driver',
        lat: driverPoint.latitude,
        lng: driverPoint.longitude,
        title: 'Driver',
      });
    }
    restaurantPoints.forEach(({ restaurant, point }) => {
      list.push({
        id: `restaurant-${restaurant._id || restaurant.id}`,
        kind: 'restaurant',
        lat: point.latitude,
        lng: point.longitude,
        title: restaurant.name || 'Restaurant',
        subtitle:
          restaurant.distance != null ? `${Number(restaurant.distance).toFixed(1)} km` : undefined,
      });
    });
    return list;
  }, [driverPoint, restaurantPoints]);

  const mapHtml = useMemo(() => buildMapHtml(center, markers), []); // initial only

  useEffect(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win?.__updateDriverMap) return;
    win.__updateDriverMap({ center, markers });
  }, [center, markers]);

  return (
    <View style={style} testID="driver-nearby-map-web">
      <iframe
        ref={iframeRef}
        title="Driver nearby map"
        srcDoc={mapHtml}
        style={{
          border: 'none',
          width: '100%',
          height: '100%',
          position: 'absolute',
          inset: 0,
          background: '#eef1f5',
        }}
      />
    </View>
  );
}
