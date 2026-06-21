function buildKickMeasureExpression(markerId) {
  const id = JSON.stringify(markerId);
  return `(function(){
    var markerId = ${id};
    globalThis.__HERMES_MEASURE__ = { status: 'pending' };

    function fiberName(fiber) {
      if (!fiber || !fiber.type) return '';
      var t = fiber.type;
      if (typeof t === 'string') return t;
      return t.displayName || t.name || '';
    }

    function measureHost(stateNode) {
      return new Promise(function(resolve) {
        if (!stateNode || !stateNode.canonical) {
          resolve(null);
          return;
        }
        var pi = stateNode.canonical.publicInstance;
        if (!pi || typeof pi.measureInWindow !== 'function') {
          resolve(null);
          return;
        }
        pi.measureInWindow(function(x, y, width, height) {
          resolve({
            x: x, y: y, width: width, height: height,
            centerX: x + width / 2,
            centerY: y + height / 2,
          });
        });
      });
    }

    function collectHostNodes(f, depth, bucket, maxDepth) {
      if (!f || depth > maxDepth) return;
      if (f.stateNode && f.stateNode.canonical) {
        bucket.push({ depth: depth, name: fiberName(f), node: f.stateNode });
      }
      collectHostNodes(f.child, depth + 1, bucket, maxDepth);
      collectHostNodes(f.sibling, depth, bucket, maxDepth);
    }

    var hook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!hook) {
      globalThis.__HERMES_MEASURE__ = { status: 'error', error: 'Pas de hook React' };
      return 'error';
    }

    var markerFiber = null;
    var scopeFiber = null;

    function walk(f, depth) {
      if (!f || depth > 250) return;
      var value = f.memoizedProps && f.memoizedProps.value;
      if (value && typeof value.toggleMarkerId === 'function') scopeFiber = f;
      var p = f.memoizedProps;
      if (p && p.id === markerId && p.latitude != null) markerFiber = f;
      walk(f.child, depth + 1);
      walk(f.sibling, depth);
    }

    hook.renderers.forEach(function(_, rendererID) {
      hook.getFiberRoots(rendererID).forEach(function(root) {
        walk(root.current || root, 0);
      });
    });

    if (!markerFiber) {
      globalThis.__HERMES_MEASURE__ = { status: 'error', error: 'Marker introuvable' };
      return 'error';
    }

    var markerNodes = [];
    var scopeNodes = [];
    collectHostNodes(markerFiber, 0, markerNodes, 30);
    collectHostNodes(scopeFiber || markerFiber, 0, scopeNodes, 50);

    Promise.all([
      Promise.all(markerNodes.map(function(v) {
        return measureHost(v.node).then(function(rect) {
          return { scope: 'marker', depth: v.depth, name: v.name, rect: rect };
        });
      })),
      Promise.all(scopeNodes.map(function(v) {
        return measureHost(v.node).then(function(rect) {
          return { scope: 'map', depth: v.depth, name: v.name, rect: rect };
        });
      })),
    ]).then(function(parts) {
      var markerMeasured = parts[0].filter(function(m) { return m.rect; });
      var mapMeasured = parts[1].filter(function(m) { return m.rect; });

      var icon = markerMeasured
        .filter(function(m) { return m.rect.width >= 38 && m.rect.width <= 44 && m.rect.height >= 38; })
        .sort(function(a, b) { return b.depth - a.depth; })[0] || null;

      if (!icon) {
        globalThis.__HERMES_MEASURE__ = {
          status: 'error',
          error: 'Icon introuvable',
          markerMeasured: markerMeasured,
        };
        return;
      }

      var calloutCandidates = markerMeasured.filter(function(m) {
        return m.name === 'MLRNCallout' || m.name === 'Callout' || m.name === 'RCTView' && m.rect.width >= 80;
      });
      if (calloutCandidates.length === 0) {
        calloutCandidates = mapMeasured.filter(function(m) {
          var r = m.rect;
          if (r.width < 80 && r.height < 50) return false;
          if (r.width <= 44 && r.height <= 44) return false;
          return Math.abs(r.centerX - icon.rect.centerX) < 120;
        });
      }

      var callout = calloutCandidates.sort(function(a, b) {
        return a.rect.y - b.rect.y;
      })[0] || null;

      var delta = null;
      if (callout) {
        delta = {
          dx: Math.round(callout.rect.centerX - icon.rect.centerX),
          dy: Math.round(callout.rect.centerY - icon.rect.centerY),
          gapIconTopToCalloutBottom: Math.round(icon.rect.y - (callout.rect.y + callout.rect.height)),
        };
      }

      globalThis.__HERMES_MEASURE__ = {
        status: 'done',
        markerId: markerId,
        activeId: scopeFiber && scopeFiber.memoizedProps.value
          ? scopeFiber.memoizedProps.value.activeId
          : null,
        geo: {
          latitude: markerFiber.memoizedProps.latitude,
          longitude: markerFiber.memoizedProps.longitude,
          anchor: markerFiber.memoizedProps.anchor || 'bottom',
        },
        icon: icon,
        callout: callout,
        calloutCandidates: calloutCandidates.length,
        deltaCenterPx: delta,
      };
    }).catch(function(e) {
      globalThis.__HERMES_MEASURE__ = { status: 'error', error: String(e) };
    });

    return 'started';
  })()`;
}

function buildPollMeasureExpression() {
  return `JSON.stringify(globalThis.__HERMES_MEASURE__ || { status: 'pending' })`;
}

module.exports = {
  buildKickMeasureExpression,
  buildPollMeasureExpression,
};
