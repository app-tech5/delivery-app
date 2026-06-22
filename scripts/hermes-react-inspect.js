/**
 * Inspecte l'arbre React via __REACT_DEVTOOLS_GLOBAL_HOOK__ (utilitaire interne RN).
 *
 *   node scripts/hermes-cdp.js react map
 *   node scripts/hermes-cdp.js react open restaurant-<id>
 *   node scripts/hermes-cdp.js react support
 *   node scripts/hermes-cdp.js react measure restaurant-<id>
 */

function buildOpenCalloutExpression(markerId) {
  const id = JSON.stringify(markerId);
  return `(function(){
    var markerId = ${id};
    var g = typeof globalThis !== 'undefined' ? globalThis : this;
    var hook = g.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!hook) return JSON.stringify({ error: 'Pas de hook React' });

    var toggled = false;
    var activeId = null;

    function walk(f, depth) {
      if (!f || depth > 250) return;
      var value = f.memoizedProps && f.memoizedProps.value;
      if (value && typeof value.toggleMarkerId === 'function') {
        if (value.activeId === markerId) {
          value.toggleMarkerId(markerId);
        }
        value.toggleMarkerId(markerId);
        activeId = markerId;
        toggled = true;
      }
      walk(f.child, depth + 1);
      walk(f.sibling, depth);
    }

    hook.renderers.forEach(function(_, rendererID) {
      hook.getFiberRoots(rendererID).forEach(function(root) {
        walk(root.current || root, 0);
      });
    });

    return JSON.stringify({ markerId: markerId, opened: toggled, activeId: activeId }, null, 2);
  })()`;
}

function buildSupportTreeExpression() {
  return `(function(){
    var hook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!hook) return JSON.stringify({ error: 'Pas de hook React' });

    var texts = [];

    function fiberName(fiber) {
      if (!fiber || !fiber.type) return '';
      var t = fiber.type;
      if (typeof t === 'string') return t;
      return t.displayName || t.name || t.render?.displayName || '';
    }

    function walkSubtree(fiber, depth) {
      if (!fiber || depth > 400) return;
      if (fiberName(fiber) === 'Text') {
        var children = fiber.memoizedProps && fiber.memoizedProps.children;
        if (typeof children === 'string' && children.trim()) {
          texts.push(children.trim());
        }
      }
      walkSubtree(fiber.child, depth + 1);
      walkSubtree(fiber.sibling, depth);
    }

    function findSupportScreen(fiber, depth) {
      if (!fiber || depth > 400) return;
      if (fiberName(fiber) === 'SupportScreen') {
        walkSubtree(fiber.child, 0);
      }
      findSupportScreen(fiber.child, depth + 1);
      findSupportScreen(fiber.sibling, depth);
    }

    hook.renderers.forEach(function(_, rendererID) {
      hook.getFiberRoots(rendererID).forEach(function(root) {
        findSupportScreen(root.current || root, 0);
      });
    });

    return JSON.stringify({ screen: 'SupportScreen', count: texts.length, texts: texts }, null, 2);
  })()`;
}

function buildReactInspectExpression(query) {
  const q = JSON.stringify(query || 'map');
  return `(function(){
    var query = ${q};
    var g = typeof globalThis !== 'undefined' ? globalThis : this;
    var hook = g.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!hook) return JSON.stringify({ error: 'Pas de __REACT_DEVTOOLS_GLOBAL_HOOK__' });

    var renderers = hook.renderers;
    if (!renderers || renderers.size === 0) return JSON.stringify({ error: 'Aucun renderer React' });

    function fiberName(fiber) {
      if (!fiber || !fiber.type) return '';
      var t = fiber.type;
      if (typeof t === 'string') return t;
      return t.displayName || t.name || t.render?.displayName || '';
    }

    function pickMapContainerProps(props) {
      if (!props || props.nearbyRestaurants == null) return null;
      var restaurants = props.nearbyRestaurants || [];
      return {
        driverLocation: props.driverLocation || null,
        restaurantsLoading: props.restaurantsLoading,
        restaurantCount: restaurants.length,
        restaurants: restaurants.slice(0, 30).map(function(r) {
          return {
            name: r.name,
            latitude: r.latitude,
            longitude: r.longitude,
            distance: r.distance,
            isAvailableForDelivery: r.isAvailableForDelivery,
          };
        }),
      };
    }

    function pickMarkerProps(props) {
      if (!props || props.latitude == null || props.longitude == null) return null;
      return {
        id: props.id,
        kind: props.kind,
        latitude: props.latitude,
        longitude: props.longitude,
        calloutTitle: props.calloutTitle,
      };
    }

    var containers = [];
    var markers = [];
    var names = {};
    var nameList = [];

    function walk(fiber, depth) {
      if (!fiber || depth > 250) return;
      var n = fiberName(fiber);
      var props = fiber.memoizedProps;

      if (n) {
        names[n] = (names[n] || 0) + 1;
      }

      if (query === 'list') {
        walk(fiber.child, depth + 1);
        walk(fiber.sibling, depth);
        return;
      }

      if (query === 'map' || query === 'markers') {
        var container = pickMapContainerProps(props);
        if (container) containers.push({ component: n || '(anonymous)', props: container });
        var marker = pickMarkerProps(props);
        if (marker) markers.push({ component: n || 'MapEntityMarker', props: marker });
      } else if (n && (n === query || n.indexOf(query) !== -1)) {
        containers.push({ component: n, props: pickMapContainerProps(props) || props });
      }

      walk(fiber.child, depth + 1);
      walk(fiber.sibling, depth);
    }

    renderers.forEach(function(renderer, rendererID) {
      var roots = hook.getFiberRoots(rendererID);
      if (!roots) return;
      roots.forEach(function(root) {
        walk(root.current || root, 0);
      });
    });

    if (query === 'list') {
      for (var k in names) nameList.push({ name: k, count: names[k] });
      nameList.sort(function(a, b) { return b.count - a.count; });
      return JSON.stringify({ components: nameList.slice(0, 60) }, null, 2);
    }

    if (query === 'map' || query === 'markers') {
      return JSON.stringify({ containers: containers, markers: markers }, null, 2);
    }

    return JSON.stringify({ component: query, matches: containers }, null, 2);
  })()`;
}

module.exports = {
  buildReactInspectExpression,
  buildOpenCalloutExpression,
  buildSupportTreeExpression,
};
