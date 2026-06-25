#!/usr/bin/env node
/**
 * Teste les boutons de statut sur Home pour le NOUVEAU compte SignUp local.
 * Ne se connecte jamais à driver@demo.com — utilise la session en cours
 * ou crée un compte SignUp frais (logout + signup uniquement).
 *
 *   node scripts/hermes-home-status-test.js
 */

const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const METRO = process.env.METRO_URL || 'http://127.0.0.1:8081';
const DEMO_EMAIL = process.env.DEMO_EMAIL || 'driver@demo.com';
const SNAPSHOT_PATH = path.join(__dirname, 'hermes-home-status-snapshot.json');

const STATUS_LABELS = {
  available: ['Available', 'Disponible'],
  busy: ['Busy', 'Occupé'],
  offline: ['Offline', 'Hors ligne'],
};

const READ_HOME_STATE = `(function(){
  var hook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!hook) return JSON.stringify({ error: 'Pas de hook React' });

  function fiberName(fiber) {
    if (!fiber || !fiber.type) return '';
    var t = fiber.type;
    if (typeof t === 'string') return t;
    return t.displayName || t.name || t.render?.displayName || '';
  }

  function readHookStates(fiber) {
    var states = [];
    var hookNode = fiber && fiber.memoizedState;
    while (hookNode) {
      if (hookNode.queue && Object.prototype.hasOwnProperty.call(hookNode, 'memoizedState')) {
        states.push(hookNode.memoizedState);
      }
      hookNode = hookNode.next;
    }
    return states;
  }

  var onHome = false;
  var statusBadgeText = null;
  var statusButtons = [];
  var driverMarker = null;
  var driverProviderStates = null;
  var mapTexts = [];

  function getTextChildren(fiber) {
    var texts = [];
    function walkText(node, depth) {
      if (!node || depth > 8) return;
      var props = node.memoizedProps || {};
      if (fiberName(node) === 'Text' && typeof props.children === 'string') {
        texts.push(props.children.trim());
      }
      walkText(node.child, depth + 1);
      walkText(node.sibling, depth);
    }
    walkText(fiber, 0);
    return texts;
  }

  function walk(fiber, depth, insideHome) {
    if (!fiber || depth > 650) return;
    var n = fiberName(fiber);
    var inside = insideHome || n === 'HomeScreen';
    if (n === 'HomeScreen') onHome = true;
    if (n === 'DriverProvider') driverProviderStates = readHookStates(fiber);

    var props = fiber.memoizedProps || {};

    if (inside && props.testID === 'driver-status-badge' && typeof props.children === 'string') {
      statusBadgeText = props.children.trim();
    }

    if (inside && n === 'TouchableOpacity' && typeof props.onPress === 'function') {
      var labels = getTextChildren(fiber);
      if (labels.length) {
        statusButtons.push({ labels: labels, disabled: !!props.disabled });
      }
    }

    if (inside && props.id === 'home-driver') {
      driverMarker = {
        id: props.id,
        latitude: props.latitude,
        longitude: props.longitude,
      };
    }

    if (inside && (n === 'RestaurantMap' || n === 'DriverNearbyMap') && typeof props.children === 'string') {
      mapTexts.push(props.children);
    }

    walk(fiber.child, depth + 1, inside);
    walk(fiber.sibling, depth, insideHome);
  }

  hook.renderers.forEach(function(_, rendererID) {
    hook.getFiberRoots(rendererID).forEach(function(root) {
      walk(root.current || root, 0, false);
    });
  });

  var driver = null;
  if (Array.isArray(driverProviderStates)) {
    driver = driverProviderStates[0] || null;
  }

  var storedLocation = null;
  if (driver && driver.location) {
    var coords = driver.location.coordinates;
    if (Array.isArray(coords) && coords.length >= 2) {
      storedLocation = { longitude: coords[0], latitude: coords[1], source: 'driver.location' };
    } else if (driver.location.latitude != null) {
      storedLocation = {
        latitude: driver.location.latitude,
        longitude: driver.location.longitude,
        source: 'driver.location',
      };
    }
  }

  var userEmail = null;
  var apiTokenPrefix = null;
  try {
    var req = globalThis.__r || globalThis.__metroRequire;
    if (typeof req === 'function') {
      var ids = Object.keys(req).filter(function(k){ return /^\\d+$/.test(k); });
      for (var i = 0; i < ids.length; i++) {
        try {
          var mod = req(ids[i]);
          var exp = mod && (mod.default || mod);
          if (exp && typeof exp.driverRegister === 'function' && 'token' in exp) {
            userEmail = exp.user && exp.user.email;
            apiTokenPrefix = exp.token ? String(exp.token).slice(0, 22) : null;
            break;
          }
        } catch (e) {}
      }
    }
  } catch (e) {}
  if (!userEmail && driver && driver.userId) {
    userEmail = driver.userId.email || null;
  }

  var driverId = driver && (driver._id || driver.id) || null;

  return JSON.stringify({
    onHome: onHome,
    statusBadgeText: statusBadgeText,
    driverStatus: driver && driver.status || null,
    driverId: driverId,
    isApproved: !!(driver && driver.isApproved),
    isDemoDriver: !!(driver && driver.isDemo),
    userEmail: userEmail,
    apiTokenPrefix: apiTokenPrefix,
    isLocalSignupAccount: !!(
      (apiTokenPrefix && apiTokenPrefix.indexOf('demo_driver_token_') === 0) ||
      (driverId && String(driverId).indexOf('demo_driver_') === 0) ||
      (driver && driver.isDemo && userEmail !== 'driver@demo.com')
    ),
    isSeededDemoAccount: userEmail === 'driver@demo.com',
    statusButtons: statusButtons.filter(function(btn) {
      return btn.labels.some(function(label) {
        return /available|busy|offline|disponible|occupé|hors ligne/i.test(label);
      });
    }),
    mapDriverMarker: driverMarker,
    storedLocation: storedLocation,
    parisFallbackWouldApply: !storedLocation && userEmail !== 'driver@demo.com',
  });
})()`;

function buildPressStatus(labelOptions) {
  const labelsJson = JSON.stringify(labelOptions);
  return `(function(){
    var hook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!hook) return JSON.stringify({ error: 'Pas de hook React' });
    var targets = ${labelsJson};

    function fiberName(fiber) {
      if (!fiber || !fiber.type) return '';
      var t = fiber.type;
      if (typeof t === 'string') return t;
      return t.displayName || t.name || '';
    }

    function collectTexts(fiber, depth, acc) {
      if (!fiber || depth > 10) return acc;
      var props = fiber.memoizedProps || {};
      if (fiberName(fiber) === 'Text' && typeof props.children === 'string') {
        acc.push(props.children.trim());
      }
      collectTexts(fiber.child, depth + 1, acc);
      collectTexts(fiber.sibling, depth, acc);
      return acc;
    }

    var pressed = null;

    function walk(fiber, depth, insideHome) {
      if (!fiber || depth > 600 || pressed) return;
      var inside = insideHome || fiberName(fiber) === 'HomeScreen';
      var props = fiber.memoizedProps || {};

      if (inside && fiberName(fiber) === 'TouchableOpacity' && typeof props.onPress === 'function' && !props.disabled) {
        var labels = collectTexts(fiber, 0, []);
        var match = labels.find(function(label) {
          return targets.some(function(target) { return label === target; });
        });
        if (match) {
          props.onPress();
          pressed = { label: match, labels: labels };
          return;
        }
      }

      walk(fiber.child, depth + 1, inside);
      walk(fiber.sibling, depth, insideHome);
    }

    hook.renderers.forEach(function(_, rendererID) {
      hook.getFiberRoots(rendererID).forEach(function(root) {
        walk(root.current || root, 0, false);
      });
    });

    if (!pressed) return JSON.stringify({ error: 'Bouton statut introuvable', targets: targets });
    return JSON.stringify({ pressed: true, button: pressed });
  })()`;
}

const INVOKE_DRIVER_LOGOUT = `(async function(){
  var hook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!hook) return JSON.stringify({ error: 'Pas de hook React' });
  var logoutFn = null;
  function walk(fiber, depth) {
    if (!fiber || depth > 600) return;
    var props = fiber.memoizedProps || {};
    if (props.value && typeof props.value.logout === 'function') logoutFn = props.value.logout;
    walk(fiber.child, depth + 1);
    walk(fiber.sibling, depth);
  }
  hook.renderers.forEach(function(_, rendererID) {
    hook.getFiberRoots(rendererID).forEach(function(root) { walk(root.current || root, 0); });
  });
  if (!logoutFn) return JSON.stringify({ error: 'logout introuvable' });
  await logoutFn();
  return JSON.stringify({ loggedOut: true });
})()`;

const NAV_TO_SIGNUP = `(function(){
  var hook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!hook) return JSON.stringify({ error: 'Pas de hook React' });
  function walk(fiber, depth) {
    if (!fiber || depth > 400) return false;
    var props = fiber.memoizedProps || {};
    if (props.navigation && typeof props.navigation.navigate === 'function') {
      props.navigation.navigate('SignUp');
      return true;
    }
    if (walk(fiber.child, depth + 1)) return true;
    if (walk(fiber.sibling, depth)) return true;
    return false;
  }
  var navigated = false;
  hook.renderers.forEach(function(_, rendererID) {
    hook.getFiberRoots(rendererID).forEach(function(root) {
      if (walk(root.current || root, 0)) navigated = true;
    });
  });
  return JSON.stringify({ navigated: navigated });
})()`;

const PRESS_SIGNUP_SUBMIT = `(function(){
  var hook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!hook) return JSON.stringify({ error: 'Pas de hook React' });
  function fiberName(fiber) {
    if (!fiber || !fiber.type) return '';
    var t = fiber.type;
    if (typeof t === 'string') return t;
    return t.displayName || t.name || '';
  }
  var button = null;
  function walk(fiber, depth, inside) {
    if (!fiber || depth > 500) return;
    var inForm = inside || fiberName(fiber) === 'SignUpScreen';
    var props = fiber.memoizedProps || {};
    if (inForm && props.title === 'Sign Up' && typeof props.onPress === 'function' && !props.loading) button = fiber;
    walk(fiber.child, depth + 1, inForm);
    walk(fiber.sibling, depth, inside);
  }
  hook.renderers.forEach(function(_, rendererID) {
    hook.getFiberRoots(rendererID).forEach(function(root) {
      walk(root.current || root, 0, false);
    });
  });
  if (!button) return JSON.stringify({ error: 'Sign Up introuvable' });
  button.memoizedProps.onPress();
  return JSON.stringify({ pressed: true });
})()`;

const PRESS_ONBOARDING_SUBMIT = `(function(){
  var hook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!hook) return JSON.stringify({ error: 'Pas de hook React' });
  function fiberName(fiber) {
    if (!fiber || !fiber.type) return '';
    var t = fiber.type;
    if (typeof t === 'string') return t;
    return t.displayName || t.name || '';
  }
  var button = null;
  function walk(fiber, depth, inside) {
    if (!fiber || depth > 500) return;
    var inForm = inside || fiberName(fiber) === 'DriverOnboardingScreen';
    var props = fiber.memoizedProps || {};
    if (inForm && props.title === 'Create driver profile' && typeof props.onPress === 'function' && !props.loading) button = fiber;
    walk(fiber.child, depth + 1, inForm);
    walk(fiber.sibling, depth, inside);
  }
  hook.renderers.forEach(function(_, rendererID) {
    hook.getFiberRoots(rendererID).forEach(function(root) {
      walk(root.current || root, 0, false);
    });
  });
  if (!button) return JSON.stringify({ error: 'Onboarding submit introuvable' });
  button.memoizedProps.onPress();
  return JSON.stringify({ pressed: true });
})()`;

function buildSetField(screenName, placeholder, value) {
  return `(function(){
    var hook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!hook) return JSON.stringify({ error: 'Pas de hook React' });
    var target = null;
    function walk(fiber, depth, inside) {
      if (!fiber || depth > 500) return;
      var n = fiber.type && (typeof fiber.type === 'string' ? fiber.type : (fiber.type.displayName || fiber.type.name || ''));
      var inForm = inside || n === ${JSON.stringify(screenName)};
      var props = fiber.memoizedProps || {};
      if (inForm && props.placeholder === ${JSON.stringify(placeholder)} && typeof props.onChangeText === 'function') {
        target = fiber;
      }
      walk(fiber.child, depth + 1, inForm);
      walk(fiber.sibling, depth, inside);
    }
    hook.renderers.forEach(function(_, rendererID) {
      hook.getFiberRoots(rendererID).forEach(function(root) {
        walk(root.current || root, 0, false);
      });
    });
    if (!target) return JSON.stringify({ error: 'Champ introuvable' });
    target.memoizedProps.onChangeText(${JSON.stringify(value)});
    return JSON.stringify({ ok: true });
  })()`;
}

async function getWebSocketUrl() {
  const res = await fetch(`${METRO}/json/list`);
  const targets = await res.json();
  const target = targets.find((t) => t.description?.includes('Bridgeless')) || targets[0];
  if (!target?.webSocketDebuggerUrl) {
    throw new Error('Pas de cible Hermes. App ouverte + Metro actif ?');
  }
  return target.webSocketDebuggerUrl;
}

function evaluate(ws, expression, { awaitPromise = false } = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1e6);
    const timer = setTimeout(() => reject(new Error('Timeout CDP')), 30000);

    const onMessage = (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.id !== id) return;
      clearTimeout(timer);
      ws.removeListener('message', onMessage);
      if (msg.result?.exceptionDetails) {
        reject(new Error(JSON.stringify(msg.result.exceptionDetails)));
        return;
      }
      const val = msg.result?.result?.value;
      if (typeof val === 'string') {
        resolve(JSON.parse(val));
        return;
      }
      resolve(msg.result?.result ?? msg.result);
    };

    ws.on('message', onMessage);
    ws.send(JSON.stringify({
      id,
      method: 'Runtime.evaluate',
      params: { expression, returnByValue: true, awaitPromise },
    }));
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function readHome(ws) {
  return evaluate(ws, READ_HOME_STATE);
}

async function pressStatus(ws, statusKey) {
  return evaluate(ws, buildPressStatus(STATUS_LABELS[statusKey]));
}

async function signupNewAccount(ws) {
  await evaluate(ws, INVOKE_DRIVER_LOGOUT, { awaitPromise: true }).catch(() => null);
  await sleep(1200);
  await evaluate(ws, NAV_TO_SIGNUP);
  await sleep(500);

  const uniqueEmail = `hermes.status.${Date.now()}@demo.com`;
  const fields = {
    'Full Name': 'Hermes Status Driver',
    Email: uniqueEmail,
    Phone: '+33601020304',
    Password: 'driver123',
    'Confirm Password': 'driver123',
  };
  for (const [placeholder, value] of Object.entries(fields)) {
    await evaluate(ws, buildSetField('SignUpScreen', placeholder, value));
    await sleep(60);
  }
  await evaluate(ws, PRESS_SIGNUP_SUBMIT);
  await sleep(900);

  const onboardingFields = {
    'License Number': 'HERMES-STATUS-01',
    'Vehicle Type': 'bike',
    'Vehicle Model': 'City Runner',
    'License Plate': 'ST-001-AA',
  };
  for (const [placeholder, value] of Object.entries(onboardingFields)) {
    await evaluate(ws, buildSetField('DriverOnboardingScreen', placeholder, value));
    await sleep(60);
  }
  await evaluate(ws, PRESS_ONBOARDING_SUBMIT);
  await sleep(1200);

  const home = await readHome(ws);
  return { ready: true, home, email: uniqueEmail, created: true };
}

async function ensureNewSignupHome(ws) {
  let home = await readHome(ws);

  if (home.onHome && home.isLocalSignupAccount && !home.isSeededDemoAccount) {
    return { ready: true, home, email: home.userEmail, created: false };
  }

  if (home.isSeededDemoAccount || !home.isLocalSignupAccount) {
    console.log('\n⚠️  Mauvais compte détecté — logout + nouveau SignUp (sans driver@demo.com)');
    return signupNewAccount(ws);
  }

  if (!home.onHome) {
    return signupNewAccount(ws);
  }

  return { ready: true, home, email: home.userEmail, created: false };
}

async function testStatusTransition(ws, fromStatus, targetStatus) {
  const before = await readHome(ws);
  const press = await pressStatus(ws, targetStatus);
  await sleep(1200);
  const after = await readHome(ws);

  const ok = press.pressed === true && after.driverStatus === targetStatus;

  return {
    from: fromStatus || before.driverStatus,
    target: targetStatus,
    ok,
    press,
    before: {
      driverStatus: before.driverStatus,
      statusBadgeText: before.statusBadgeText,
    },
    after: {
      driverStatus: after.driverStatus,
      statusBadgeText: after.statusBadgeText,
      isApproved: after.isApproved,
    },
  };
}

async function main() {
  const wsUrl = await getWebSocketUrl();
  console.log('WebSocket:', wsUrl);

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.once('open', resolve);
    ws.once('error', reject);
  });

  const steps = [];
  let failed = false;

  const homeReady = await ensureNewSignupHome(ws);
  steps.push({
    step: 'nouveau compte SignUp sur Home',
    ok: homeReady.ready === true && homeReady.home?.isLocalSignupAccount === true,
    email: homeReady.email,
    created: homeReady.created,
    home: homeReady.home,
  });
  console.log('\n=== 1. Nouveau compte SignUp — Home ===');
  console.log(JSON.stringify(steps[steps.length - 1], null, 2));
  if (!steps[steps.length - 1].ok) failed = true;

  if (homeReady.home?.isSeededDemoAccount) {
    console.error('ERREUR: test lancé sur driver@demo.com — interdit pour ce scénario');
    process.exit(1);
  }

  const initial = await readHome(ws);
  const buttonsOk = (initial.statusButtons || []).length >= 3;
  steps.push({
    step: 'status buttons visible',
    ok: buttonsOk && initial.onHome,
    initial,
  });
  console.log('\n=== 2. Boutons statut (état initial) ===');
  console.log(JSON.stringify(steps[steps.length - 1], null, 2));
  if (!buttonsOk) failed = true;

  const sequence = ['available', 'busy', 'offline', 'available'];
  const transitions = [];

  for (const status of sequence) {
    const result = await testStatusTransition(ws, null, status);
    transitions.push(result);
    console.log(`\n=== Statut → ${status} ===`);
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) failed = true;
  }

  steps.push({
    step: 'status transitions',
    ok: transitions.every((t) => t.ok),
    transitions,
  });

  const final = await readHome(ws);
  const mapAnalysis = {
    storedLocation: final.storedLocation,
    mapDriverMarker: final.mapDriverMarker,
    parisFallbackWouldApply: final.parisFallbackWouldApply,
    account: final.userEmail,
    isApproved: final.isApproved,
    note: final.storedLocation
      ? 'Carte sur driver.location enregistré (GPS envoyé après passage en ligne)'
      : final.parisFallbackWouldApply
        ? 'Pas de position enregistrée → fallback Paris (48.8566, 2.3522) sur la carte'
        : 'Pas de marqueur — position non définie',
    realGpsExpected: 'Oui pour nouveau compte SignUp : GPS appareil quand approuvé + available/busy',
  };

  steps.push({
    step: 'map location analysis',
    ok: true,
    mapAnalysis,
    final,
  });
  console.log('\n=== Carte / localisation ===');
  console.log(JSON.stringify(steps[steps.length - 1], null, 2));

  const report = {
    capturedAt: new Date().toISOString(),
    passed: steps.filter((s) => s.ok).length,
    total: steps.length,
    ok: !failed,
    steps,
    mapAnalysis,
  };
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(report, null, 2));

  console.log('\n=== Résumé ===');
  console.log(JSON.stringify({
    passed: report.passed,
    total: report.total,
    ok: report.ok,
    finalStatus: final.driverStatus,
    transitionsOk: transitions.every((t) => t.ok),
    snapshot: SNAPSHOT_PATH,
  }, null, 2));

  ws.close();
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
