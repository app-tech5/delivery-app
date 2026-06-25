#!/usr/bin/env node
/**
 * Hermes E2E: login compte démo → logout → signup → Home
 * Vérifie les livraisons actives sur le nouveau compte.
 *
 *   node scripts/hermes-demo-logout-signup-test.js
 */

const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const METRO = process.env.METRO_URL || 'http://127.0.0.1:8081';
const DEMO_EMAIL = process.env.DEMO_EMAIL || 'driver@demo.com';
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'driver123';
const SNAPSHOT_PATH = path.join(__dirname, 'hermes-demo-logout-signup-snapshot.json');

const READ_NAV_STATE = `(function(){
  var hook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!hook) return JSON.stringify({ error: 'Pas de hook React' });

  function fiberName(fiber) {
    if (!fiber || !fiber.type) return '';
    var t = fiber.type;
    if (typeof t === 'string') return t;
    return t.displayName || t.name || t.render?.displayName || '';
  }

  var routes = [];
  var screens = {};
  var authHookStates = null;

  function walk(fiber, depth) {
    if (!fiber || depth > 500) return;
    var n = fiberName(fiber);
    if (n === 'SignUpScreen') screens.SignUpScreen = true;
    if (n === 'LoginScreen') screens.LoginScreen = true;
    if (n === 'DriverOnboardingScreen') screens.DriverOnboardingScreen = true;
    if (n === 'DrawerNavigator') screens.DrawerNavigator = true;
    if (n === 'HomeScreen') screens.HomeScreen = true;

    var route = fiber.memoizedProps && fiber.memoizedProps.route;
    if (route && route.name) routes.push(route.name);

    if (n === 'DriverProvider') {
      var states = [];
      var hookNode = fiber.memoizedState;
      while (hookNode) {
        if (hookNode.queue && Object.prototype.hasOwnProperty.call(hookNode, 'memoizedState')) {
          states.push(hookNode.memoizedState);
        }
        hookNode = hookNode.next;
      }
      if (states.length >= 4) authHookStates = states;
    }

    walk(fiber.child, depth + 1);
    walk(fiber.sibling, depth);
  }

  hook.renderers.forEach(function(_, rendererID) {
    hook.getFiberRoots(rendererID).forEach(function(root) {
      walk(root.current || root, 0);
    });
  });

  return JSON.stringify({
    routes: routes.filter(function(v, i, a){ return a.indexOf(v) === i; }),
    screens: screens,
    auth: authHookStates ? {
      hasDriver: !!(authHookStates[0] && (authHookStates[0]._id || authHookStates[0].id)),
      isLoading: !!authHookStates[1],
      isAuthenticated: !!authHookStates[2],
      needsOnboarding: !!authHookStates[3],
    } : null,
  });
})()`;

const READ_HOME_SNAPSHOT = `(function(){
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

  var texts = [];
  var deliveryCardIds = [];
  var driverProviderStates = null;

  function walk(fiber, depth, insideHome) {
    if (!fiber || depth > 600) return;
    var n = fiberName(fiber);
    var inside = insideHome || n === 'HomeScreen';

    if (n === 'DriverProvider') driverProviderStates = readHookStates(fiber);

    var props = fiber.memoizedProps || {};
    if (inside && props.testID && String(props.testID).indexOf('delivery-delivered-') === 0) {
      deliveryCardIds.push(props.testID);
    }
    if (inside && n === 'Text' && typeof props.children === 'string') {
      var t = props.children.trim();
      if (t) texts.push(t);
    }

    walk(fiber.child, depth + 1, inside);
    walk(fiber.sibling, depth, insideHome);
  }

  hook.renderers.forEach(function(_, rendererID) {
    hook.getFiberRoots(rendererID).forEach(function(root) {
      walk(root.current || root, 0, false);
    });
  });

  var deliveriesCount = 0;
  var activeFromState = [];
  var driverSnapshot = null;

  if (Array.isArray(driverProviderStates)) {
    var driver = driverProviderStates[0];
    var deliveries = null;
    for (var i = 0; i < driverProviderStates.length; i++) {
      var candidate = driverProviderStates[i];
      if (!Array.isArray(candidate)) continue;
      if (candidate.length === 0 || (candidate[0] && (candidate[0].status || candidate[0]._id || candidate[0].id))) {
        deliveries = candidate;
      }
    }
    if (Array.isArray(deliveries)) {
      deliveriesCount = deliveries.length;
      activeFromState = deliveries.filter(function(d) {
        return d && d.status === 'out_for_delivery' && (!d.delivery || d.delivery.type !== 'pickup');
      }).map(function(d) {
        return { id: String(d._id || d.id || ''), status: d.status };
      });
    }
    if (driver && typeof driver === 'object') {
      driverSnapshot = {
        id: driver._id || driver.id || null,
        licenseNumber: driver.licenseNumber || null,
        email: driver.userId && driver.userId.email || null,
        isDemo: !!driver.isDemo,
      };
    }
  }

  return JSON.stringify({
    activeDeliveriesSectionVisible: texts.some(function(t) {
      return t === 'Active Deliveries' || t === 'Livraisons actives';
    }),
    deliveryCardCount: deliveryCardIds.length,
    deliveryCardTestIds: deliveryCardIds,
    visibleTexts: texts.slice(0, 30),
    driver: driverSnapshot,
    deliveriesInContext: deliveriesCount,
    activeDeliveriesInContext: activeFromState,
    activeCount: activeFromState.length,
  });
})()`;

const INVOKE_DRIVER_LOGOUT = `(async function(){
  var hook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!hook) return JSON.stringify({ error: 'Pas de hook React' });

  var logoutFn = null;

  function walk(fiber, depth) {
    if (!fiber || depth > 600) return;
    var props = fiber.memoizedProps || {};
    if (props.value && typeof props.value.logout === 'function' && typeof props.value.login === 'function') {
      logoutFn = props.value.logout;
    }
    walk(fiber.child, depth + 1);
    walk(fiber.sibling, depth);
  }

  hook.renderers.forEach(function(_, rendererID) {
    hook.getFiberRoots(rendererID).forEach(function(root) {
      walk(root.current || root, 0);
    });
  });

  if (!logoutFn) return JSON.stringify({ error: 'logout introuvable dans DriverContext' });
  await logoutFn();
  return JSON.stringify({ loggedOut: true });
})()`;

const READ_LOGIN_FORM = `(function(){
  var hook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!hook) return JSON.stringify({ error: 'Pas de hook React' });

  function fiberName(fiber) {
    if (!fiber || !fiber.type) return '';
    var t = fiber.type;
    if (typeof t === 'string') return t;
    return t.displayName || t.name || '';
  }

  function readUseState(fiber) {
    var states = [];
    var hookNode = fiber.memoizedState;
    while (hookNode) {
      if (hookNode.queue && Object.prototype.hasOwnProperty.call(hookNode, 'memoizedState')) {
        states.push(hookNode.memoizedState);
      }
      hookNode = hookNode.next;
    }
    return states;
  }

  var loginFiber = null;
  var submitButton = null;

  function walk(fiber, depth, inside) {
    if (!fiber || depth > 500) return;
    var n = fiberName(fiber);
    var inForm = inside || n === 'LoginScreen';
    var props = fiber.memoizedProps || {};
    if (n === 'LoginScreen') loginFiber = fiber;
    if (inForm && props.title && typeof props.onPress === 'function') {
      submitButton = { title: props.title, loading: !!props.loading };
    }
    walk(fiber.child, depth + 1, inForm);
    walk(fiber.sibling, depth, inside);
  }

  hook.renderers.forEach(function(_, rendererID) {
    hook.getFiberRoots(rendererID).forEach(function(root) {
      walk(root.current || root, 0, false);
    });
  });

  if (!loginFiber) return JSON.stringify({ error: 'LoginScreen introuvable' });

  var states = readUseState(loginFiber);
  return JSON.stringify({
    email: states[0] || '',
    password: states[1] ? '***' : '',
    passwordSet: !!states[1],
    submitButton: submitButton,
  });
})()`;

const PRESS_LOGIN = `(function(){
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
    var inForm = inside || fiberName(fiber) === 'LoginScreen';
    var props = fiber.memoizedProps || {};
    if (inForm && props.title && typeof props.onPress === 'function' && !props.loading) {
      if (props.title === 'Sign In' || props.title === 'Se connecter') {
        button = fiber;
      }
    }
    walk(fiber.child, depth + 1, inForm);
    walk(fiber.sibling, depth, inside);
  }

  hook.renderers.forEach(function(_, rendererID) {
    hook.getFiberRoots(rendererID).forEach(function(root) {
      walk(root.current || root, 0, false);
    });
  });

  if (!button) return JSON.stringify({ error: 'Bouton Sign In introuvable' });
  button.memoizedProps.onPress();
  return JSON.stringify({ pressed: true, title: button.memoizedProps.title });
})()`;

const NAV_TO_SIGNUP = `(function(){
  var hook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!hook) return JSON.stringify({ error: 'Pas de hook React' });

  function walk(fiber, depth) {
    if (!fiber || depth > 400) return;
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
    if (!target) return JSON.stringify({ error: 'Champ introuvable', placeholder: ${JSON.stringify(placeholder)} });
    target.memoizedProps.onChangeText(${JSON.stringify(value)});
    return JSON.stringify({ ok: true });
  })()`;
}

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
    if (inForm && props.title === 'Sign Up' && typeof props.onPress === 'function' && !props.loading) {
      button = fiber;
    }
    walk(fiber.child, depth + 1, inForm);
    walk(fiber.sibling, depth, inside);
  }
  hook.renderers.forEach(function(_, rendererID) {
    hook.getFiberRoots(rendererID).forEach(function(root) {
      walk(root.current || root, 0, false);
    });
  });
  if (!button) return JSON.stringify({ error: 'Bouton Sign Up introuvable' });
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
    if (inForm && props.title === 'Create driver profile' && typeof props.onPress === 'function' && !props.loading) {
      button = fiber;
    }
    walk(fiber.child, depth + 1, inForm);
    walk(fiber.sibling, depth, inside);
  }
  hook.renderers.forEach(function(_, rendererID) {
    hook.getFiberRoots(rendererID).forEach(function(root) {
      walk(root.current || root, 0, false);
    });
  });
  if (!button) return JSON.stringify({ error: 'Bouton onboarding introuvable' });
  button.memoizedProps.onPress();
  return JSON.stringify({ pressed: true });
})()`;

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
      if (val && typeof val === 'object' && val.loggedOut === true) {
        resolve(val);
        return;
      }
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

async function ensureLoginScreen(ws) {
  let nav = await evaluate(ws, READ_NAV_STATE);
  if (nav.auth?.isAuthenticated) {
    const logout = await evaluate(ws, INVOKE_DRIVER_LOGOUT, { awaitPromise: true });
    if (logout.error) throw new Error(logout.error);
    await sleep(1200);
    nav = await evaluate(ws, READ_NAV_STATE);
  }
  return nav;
}

async function fillSignupAndOnboard(ws, uniqueEmail) {
  const fields = {
    'Full Name': 'Hermes Driver',
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
    'License Number': 'HERMES-LIC-002',
    'Vehicle Type': 'bike',
    'Vehicle Model': 'City Runner',
    'License Plate': 'XY-999-ZZ',
  };
  for (const [placeholder, value] of Object.entries(onboardingFields)) {
    await evaluate(ws, buildSetField('DriverOnboardingScreen', placeholder, value));
    await sleep(60);
  }

  await evaluate(ws, PRESS_ONBOARDING_SUBMIT);
  await sleep(1200);
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

  // 1. Écran login (logout si session active)
  let nav = await ensureLoginScreen(ws);
  const loginForm = await evaluate(ws, READ_LOGIN_FORM);
  const loginScreenOk = !loginForm.error && nav.screens?.LoginScreen !== false;
  steps.push({ step: 'login screen ready', ok: loginScreenOk, nav, loginForm });
  console.log('\n=== 1. Écran Login ===');
  console.log(JSON.stringify(steps[steps.length - 1], null, 2));
  if (!loginScreenOk) failed = true;

  // 2. Connexion compte démo
  if (!loginForm.passwordSet) {
    await evaluate(ws, buildSetField('LoginScreen', 'Email', DEMO_EMAIL));
    await evaluate(ws, buildSetField('LoginScreen', 'Password', DEMO_PASSWORD));
    await sleep(100);
  }
  const loginPress = await evaluate(ws, PRESS_LOGIN);
  await sleep(2800);
  nav = await evaluate(ws, READ_NAV_STATE);
  const demoLoginOk = loginPress.pressed === true
    && nav.auth?.isAuthenticated === true
    && nav.auth?.hasDriver === true
    && (nav.screens?.HomeScreen || nav.screens?.DrawerNavigator);
  steps.push({ step: 'demo login', ok: demoLoginOk, loginPress, nav });
  console.log('\n=== 2. Login driver@demo.com ===');
  console.log(JSON.stringify(steps[steps.length - 1], null, 2));
  if (!demoLoginOk) failed = true;

  // 3. Home compte démo — livraisons actives
  const demoHome = await evaluate(ws, READ_HOME_SNAPSHOT);
  steps.push({
    step: 'demo account home deliveries',
    ok: true,
    home: demoHome,
    note: 'Référence compte seedé (peut avoir des livraisons actives)',
  });
  console.log('\n=== 3. Home compte démo (référence) ===');
  console.log(JSON.stringify(steps[steps.length - 1], null, 2));

  // 4. Déconnexion
  const logoutResult = await evaluate(ws, INVOKE_DRIVER_LOGOUT, { awaitPromise: true });
  await sleep(1500);
  nav = await evaluate(ws, READ_NAV_STATE);
  const logoutOk = nav.auth?.isAuthenticated === false;
  steps.push({ step: 'logout', ok: logoutOk, logoutResult, nav });
  console.log('\n=== 4. Déconnexion ===');
  console.log(JSON.stringify(steps[steps.length - 1], null, 2));
  if (!logoutOk) failed = true;

  // Attendre l'écran Login avant SignUp
  await sleep(800);
  nav = await evaluate(ws, READ_NAV_STATE);
  if (nav.auth?.isAuthenticated) {
    await evaluate(ws, INVOKE_DRIVER_LOGOUT, { awaitPromise: true });
    await sleep(1200);
  }

  // 5. SignUp nouveau compte
  const navSignup = await evaluate(ws, NAV_TO_SIGNUP);
  await sleep(500);
  const uniqueEmail = `hermes.afterlogout.${Date.now()}@demo.com`;
  await fillSignupAndOnboard(ws, uniqueEmail);
  nav = await evaluate(ws, READ_NAV_STATE);
  const signupOk = nav.auth?.isAuthenticated === true
    && nav.auth?.hasDriver === true
    && nav.auth?.needsOnboarding === false
    && (nav.screens?.HomeScreen || nav.screens?.DrawerNavigator);
  steps.push({ step: 'signup after logout', ok: signupOk, email: uniqueEmail, nav });
  console.log('\n=== 5. SignUp + onboarding (nouveau compte) ===');
  console.log(JSON.stringify(steps[steps.length - 1], null, 2));
  if (!signupOk) failed = true;

  // 6. Home nouveau compte — pas de livraisons actives
  await sleep(1800);
  const newHome = await evaluate(ws, READ_HOME_SNAPSHOT);
  const noActiveDeliveries = newHome.activeCount === 0
    && newHome.deliveryCardCount === 0
    && newHome.activeDeliveriesSectionVisible !== true;
  steps.push({
    step: 'new account has no active deliveries',
    ok: noActiveDeliveries,
    home: newHome,
    comparedToDemo: {
      demoActiveCount: demoHome.activeCount,
      newActiveCount: newHome.activeCount,
    },
  });
  console.log('\n=== 6. Home nouveau compte — livraisons actives ===');
  console.log(JSON.stringify(steps[steps.length - 1], null, 2));
  if (!noActiveDeliveries) failed = true;

  const report = {
    capturedAt: new Date().toISOString(),
    demoEmail: DEMO_EMAIL,
    newAccountEmail: uniqueEmail,
    passed: steps.filter((s) => s.ok).length,
    total: steps.length,
    failed: steps.filter((s) => !s.ok),
    ok: !failed,
    steps,
    demoHome,
    newHome,
  };
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(report, null, 2));

  console.log('\n=== Résumé ===');
  console.log(JSON.stringify({
    passed: report.passed,
    total: report.total,
    ok: report.ok,
    demoActiveDeliveries: demoHome.activeCount,
    newAccountActiveDeliveries: newHome.activeCount,
    snapshot: SNAPSHOT_PATH,
  }, null, 2));

  ws.close();
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
