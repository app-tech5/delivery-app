import React, { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { getPointFromLocation } from '../../utils/geoUtils';
import { DRIVER_CAR_TOP_PATH_D, DRIVER_CAR_TOP_VIEWBOX } from '../../assets/maps/driverCarTop';

const DEFAULT_ZOOM = 13;
const DRIVER_ICON_SIZE = 36;
const ICON_RING_SIZE = 40;

const getRestaurantPoint = (restaurant) => {
  const lat = parseFloat(restaurant?.latitude);
  const lng = parseFloat(restaurant?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { latitude: lat, longitude: lng };
};

// Matches MapEntityMarker KIND_DEFAULTS + styles (white ring / driver car top)
const buildMapHtml = (center, markers) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { margin:0; padding:0; width:100%; height:100%; background:#eef1f5; }
    .leaflet-control-attribution { font-size:10px; }
    .leaflet-div-icon { background: transparent !important; border: none !important; }
    .marker-root { display:flex; align-items:center; justify-content:center; }
    .driver-wrap {
      width:${DRIVER_ICON_SIZE}px; height:${DRIVER_ICON_SIZE}px;
      display:flex; align-items:center; justify-content:center;
      background: transparent;
    }
    .icon-ring {
      width:${ICON_RING_SIZE}px; height:${ICON_RING_SIZE}px;
      border-radius:${ICON_RING_SIZE / 2}px;
      border:2px solid #ea580c;
      background:#ffffff;
      display:flex; align-items:center; justify-content:center;
      box-shadow: 0 1px 3px rgba(0,0,0,.22);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const center = ${JSON.stringify(center)};
    const initialMarkers = ${JSON.stringify(markers)};
    const CAR_PATH = ${JSON.stringify(DRIVER_CAR_TOP_PATH_D)};
    const CAR_VIEWBOX = ${JSON.stringify(DRIVER_CAR_TOP_VIEWBOX)};
    const DRIVER_COLOR = '#2563eb';
    const RESTAURANT_COLOR = '#ea580c';

    const map = L.map('map', { zoomControl: true }).setView(center, ${DEFAULT_ZOOM});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    const layer = L.layerGroup().addTo(map);

    function driverHtml() {
      const strokeW = Math.max(3, (1.6 * 313) / ${DRIVER_ICON_SIZE});
      return '<div class="marker-root"><div class="driver-wrap">' +
        '<svg width="${DRIVER_ICON_SIZE}" height="${DRIVER_ICON_SIZE}" viewBox="' + CAR_VIEWBOX + '" preserveAspectRatio="xMidYMid meet">' +
        '<path d="' + CAR_PATH + '" fill="none" fill-rule="evenodd" clip-rule="evenodd" stroke="' + DRIVER_COLOR + '" stroke-width="' + strokeW + '" stroke-miterlimit="22.926"/>' +
        '</svg></div></div>';
    }

    // Exact Ionicons restaurant-outline (same asset as MapEntityMarker / @expo/vector-icons)
    function restaurantHtml() {
      return '<div class="marker-root"><div class="icon-ring">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 512 512">' +
        '<path d="M57.49 47.74l368.43 368.43a37.28 37.28 0 010 52.72h0a37.29 37.29 0 01-52.72 0l-90-91.55a32 32 0 01-9.2-22.43v-5.53a32 32 0 00-9.52-22.78l-11.62-10.73a32 32 0 00-29.8-7.44h0a48.53 48.53 0 01-46.56-12.63l-85.43-85.44C40.39 159.68 21.74 83.15 57.49 47.74z" fill="none" stroke="' + RESTAURANT_COLOR + '" stroke-linejoin="round" stroke-width="32"/>' +
        '<path d="M400 32l-77.25 77.25A64 64 0 00304 154.51v14.86a16 16 0 01-4.69 11.32L288 192M320 224l11.31-11.31a16 16 0 0111.32-4.69h14.86a64 64 0 0045.26-18.75L480 112M440 72l-80 80M200 368l-99.72 100.28a40 40 0 01-56.56 0h0a40 40 0 010-56.56L128 328" fill="none" stroke="' + RESTAURANT_COLOR + '" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/>' +
        '</svg></div></div>';
    }

    const iconFor = (kind) => {
      const isDriver = kind === 'driver';
      const size = isDriver ? ${DRIVER_ICON_SIZE} : ${ICON_RING_SIZE};
      return L.divIcon({
        className: 'gf-marker',
        html: isDriver ? driverHtml() : restaurantHtml(),
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    };

    function renderMarkers(list) {
      layer.clearLayers();
      const bounds = [];
      (list || []).forEach((m) => {
        if (!Number.isFinite(m.lat) || !Number.isFinite(m.lng)) return;
        const marker = L.marker([m.lat, m.lng], { icon: iconFor(m.kind) });
        if (m.title) {
          marker.bindPopup('<strong>' + m.title + '</strong>' + (m.subtitle ? '<br/>' + m.subtitle : ''));
        }
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
 * Web map for driver home — real Leaflet map with the same marker look as MapEntityMarker.
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

  const mapHtml = useMemo(() => buildMapHtml(center, markers), []);

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
