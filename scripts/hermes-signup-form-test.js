#!/usr/bin/env node
/**
 * Teste SignUp + onboarding livreur via Hermes CDP.
 * Ouvrez l'app sur Login ou SignUp + Metro actif.
 *
 *   node scripts/hermes-signup-form-test.js
 */

const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const HOME_SNAPSHOT_PATH = path.join(__dirname, 'hermes-signup-home-snapshot.json');

const METRO = process.env.METRO_URL || 'http://127.0.0.1:8081';

const PLACEHOLDERS = {
  name: 'Full Name',
  email: 'Email',
  phone: 'Phone',
  password: 'Password',
  confirmPassword: 'Confirm Password',
};

const ONBOARDING_PLACEHOLDERS = {
  licenseNumber: 'License Number',
  vehicleType: 'Vehicle Type',
  vehicleModel: 'Vehicle Model',
  licensePlate: 'License Plate',
};

const CREATE_PROFILE_TITLE = 'Create driver profile';

const READ_FORM = `(function(){
  var hook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!hook) return JSON.stringify({ error: 'Pas de hook React' });

  function fiberName(fiber) {
    if (!fiber || !fiber.type) return '';
    var t = fiber.type;
    if (typeof t === 'string') return t;
    return t.displayName || t.name || t.render?.displayName || '';
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

  var signupFiber = null;
  var fields = {};
  var submitButton = null;

  function walk(fiber, depth, inside) {
    if (!fiber || depth > 500) return;
    var n = fiberName(fiber);
    var inForm = inside || n === 'SignUpScreen';
    var props = fiber.memoizedProps || {};

    if (n === 'SignUpScreen') signupFiber = fiber;

    if (inForm && props.placeholder && typeof props.onChangeText === 'function') {
      fields[props.placeholder] = {
        value: props.value || '',
        secure: !!props.secureTextEntry,
      };
    }

    if (inForm && props.title && typeof props.onPress === 'function') {
      submitButton = {
        title: props.title,
        disabled: !!props.disabled,
        loading: !!props.loading,
      };
    }

    walk(fiber.child, depth + 1, inForm);
    walk(fiber.sibling, depth, inside);
  }

  hook.renderers.forEach(function(_, rendererID) {
    hook.getFiberRoots(rendererID).forEach(function(root) {
      walk(root.current || root, 0, false);
    });
  });

  if (!signupFiber) {
    return JSON.stringify({ error: 'SignUpScreen introuvable — ouvrez Sign Up depuis Login' });
  }

  var states = readUseState(signupFiber);

  return JSON.stringify({
    screen: 'SignUpScreen',
    state: {
      name: states[0] || '',
      email: states[1] || '',
      phone: states[2] || '',
      password: states[3] || '',
      confirmPassword: states[4] || '',
      showPassword: !!states[5],
      showConfirmPassword: !!states[6],
      isLoading: !!states[7],
    },
    fields,
    submitButton,
    canSubmitExpected: Boolean(
      states[0] && states[1] && states[3] && states[4] && states[3] === states[4]
    ),
  });
})()`;

const NAV_TO_SIGNUP = `(function(){
  var hook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!hook) return JSON.stringify({ error: 'Pas de hook React' });

  function fiberName(fiber) {
    if (!fiber || !fiber.type) return '';
    var t = fiber.type;
    if (typeof t === 'string') return t;
    return t.displayName || t.name || '';
  }

  var onSignup = false;
  var navigated = false;

  function walk(fiber, depth) {
    if (!fiber || depth > 400) return;
    if (fiberName(fiber) === 'SignUpScreen') onSignup = true;

    var props = fiber.memoizedProps || {};
    if (props.navigation && typeof props.navigation.navigate === 'function') {
      props.navigation.navigate('SignUp');
      navigated = true;
      return;
    }

    walk(fiber.child, depth + 1);
    walk(fiber.sibling, depth);
  }

  hook.renderers.forEach(function(_, rendererID) {
    hook.getFiberRoots(rendererID).forEach(function(root) {
      walk(root.current || root, 0);
    });
  });

  return JSON.stringify({ onSignup: onSignup, navigated: navigated && !onSignup });
})()`;

function buildSetFieldExpression(screenName, placeholder, value) {
  return `(function(){
    var hook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!hook) return JSON.stringify({ error: 'Pas de hook React' });

    var target = null;
    var screenName = ${JSON.stringify(screenName)};

    function walk(fiber, depth, inside) {
      if (!fiber || depth > 500) return;
      var n = fiber.type && (typeof fiber.type === 'string' ? fiber.type : (fiber.type.displayName || fiber.type.name || ''));
      var inForm = inside || n === screenName;
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

    if (!target) return JSON.stringify({ error: 'Champ introuvable', screen: screenName, placeholder: ${JSON.stringify(placeholder)} });
    target.memoizedProps.onChangeText(${JSON.stringify(value)});
    return JSON.stringify({ screen: screenName, placeholder: ${JSON.stringify(placeholder)}, value: ${JSON.stringify(value)} });
  })()`;
}

const READ_ONBOARDING_FORM = `(function(){
  var hook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!hook) return JSON.stringify({ error: 'Pas de hook React' });

  function fiberName(fiber) {
    if (!fiber || !fiber.type) return '';
    var t = fiber.type;
    if (typeof t === 'string') return t;
    return t.displayName || t.name || t.render?.displayName || '';
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

  var onboardingFiber = null;
  var fields = {};
  var submitButton = null;

  function walk(fiber, depth, inside) {
    if (!fiber || depth > 500) return;
    var n = fiberName(fiber);
    var inForm = inside || n === 'DriverOnboardingScreen';
    var props = fiber.memoizedProps || {};

    if (n === 'DriverOnboardingScreen') onboardingFiber = fiber;

    if (inForm && props.placeholder && typeof props.onChangeText === 'function') {
      fields[props.placeholder] = { value: props.value || '' };
    }

    if (inForm && props.title && typeof props.onPress === 'function') {
      submitButton = {
        title: props.title,
        disabled: !!props.disabled,
        loading: !!props.loading,
      };
    }

    walk(fiber.child, depth + 1, inForm);
    walk(fiber.sibling, depth, inside);
  }

  hook.renderers.forEach(function(_, rendererID) {
    hook.getFiberRoots(rendererID).forEach(function(root) {
      walk(root.current || root, 0, false);
    });
  });

  if (!onboardingFiber) {
    return JSON.stringify({ error: 'DriverOnboardingScreen introuvable' });
  }

  var states = readUseState(onboardingFiber);

  return JSON.stringify({
    screen: 'DriverOnboardingScreen',
    state: {
      licenseNumber: states[0] || '',
      vehicleType: states[1] || '',
      vehicleModel: states[2] || '',
      licensePlate: states[3] || '',
      saving: !!states[4],
    },
    fields,
    submitButton,
    canSubmitExpected: Boolean(states[0] && states[1] && states[2] && states[3]),
  });
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
  var targetTitle = ${JSON.stringify(CREATE_PROFILE_TITLE)};

  function walk(fiber, depth, inside) {
    if (!fiber || depth > 500) return;
    var inForm = inside || fiberName(fiber) === 'DriverOnboardingScreen';
    var props = fiber.memoizedProps || {};
    if (inForm && props.title === targetTitle && typeof props.onPress === 'function' && !props.loading) {
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

  if (!button) return JSON.stringify({ error: 'Bouton Create driver profile introuvable' });
  button.memoizedProps.onPress();
  return JSON.stringify({ pressed: true, title: button.memoizedProps.title });
})()`;

function buildSetFieldExpressionSignUp(placeholder, value) {
  return buildSetFieldExpression('SignUpScreen', placeholder, value);
}

const READ_AUTH_STATE = `(function(){
  var hook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!hook) return JSON.stringify({ error: 'Pas de hook React' });

  function fiberName(fiber) {
    if (!fiber || !fiber.type) return '';
    var t = fiber.type;
    if (typeof t === 'string') return t;
    return t.displayName || t.name || t.render?.displayName || '';
  }

  function readUseState(fiber) {
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

  var screens = {
    SignUpScreen: false,
    DriverOnboardingScreen: false,
    LoginScreen: false,
    HomeScreen: false,
  };
  var apiClient = null;
  var driverAuth = null;

  function walk(fiber, depth) {
    if (!fiber || depth > 500) return;
    var n = fiberName(fiber);
    if (screens[n] !== undefined) screens[n] = true;

    if (n === 'ApiClient' || (fiber.stateNode && fiber.stateNode.token !== undefined)) {
      apiClient = fiber.stateNode;
    }

    if (n === 'DriverProvider' || n === 'DriverContext') {
      driverAuth = fiber;
    }

    walk(fiber.child, depth + 1);
    walk(fiber.sibling, depth);
  }

  hook.renderers.forEach(function(_, rendererID) {
    hook.getFiberRoots(rendererID).forEach(function(root) {
      walk(root.current || root, 0);
    });
  });

  var authStates = null;
  function walkAuth(fiber, depth) {
    if (!fiber || depth > 400) return;
    if (fiberName(fiber) === 'DriverProvider') {
      authStates = readUseState(fiber);
    }
    walkAuth(fiber.child, depth + 1);
    walkAuth(fiber.sibling, depth);
  }
  hook.renderers.forEach(function(_, rendererID) {
    hook.getFiberRoots(rendererID).forEach(function(root) {
      walkAuth(root.current || root, 0);
    });
  });

  var g = globalThis;
  var client = g.__signupApiClientSnapshot || null;

  return JSON.stringify({
    screens: screens,
    auth: authStates ? {
      isAuthenticated: !!authStates[2],
      needsOnboarding: !!authStates[3],
      isLoading: !!authStates[1],
    } : null,
    apiClient: client ? {
      token: client.token || null,
      userEmail: client.user && (client.user.email || null),
      userName: client.user && (client.user.name || null),
      hasDriver: !!(client.driver && (client.driver._id || client.driver.id)),
    } : null,
  });
})()`;

const SNAPSHOT_API_CLIENT = `(function(){
  function tryModuleRequire() {
    var req = globalThis.__r || globalThis.__metroRequire;
    if (typeof req !== 'function') return null;
    var ids = Object.keys(req).filter(function(k){ return /^\\d+$/.test(k); });
    for (var i = 0; i < ids.length; i++) {
      try {
        var mod = req(ids[i]);
        var exp = mod && (mod.default || mod);
        if (exp && typeof exp.driverRegister === 'function' && 'token' in exp) {
          return exp;
        }
      } catch (e) {}
    }
    return null;
  }

  var client = tryModuleRequire();
  if (!client) {
    return JSON.stringify({ error: 'apiClient introuvable', hasMetroRequire: typeof globalThis.__r === 'function' });
  }

  globalThis.__signupApiClientSnapshot = {
    token: client.token,
    user: client.user,
    driver: client.driver,
  };

  return JSON.stringify({
    token: client.token,
    userEmail: client.user && client.user.email,
    userName: client.user && client.user.name,
    hasDriver: !!(client.driver && (client.driver._id || client.driver.id)),
    isDemoToken: String(client.token || '').indexOf('demo_driver_token_') === 0,
  });
})()`;

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
  var watchScreens = {
    SignUpScreen: true,
    DriverOnboardingScreen: true,
    DrawerNavigator: true,
    HomeScreen: true,
    LoginScreen: true,
  };

  function walk(fiber, depth) {
    if (!fiber || depth > 500) return;
    var n = fiberName(fiber);
    if (watchScreens[n]) screens[n] = true;

    var route = fiber.memoizedProps && fiber.memoizedProps.route;
    if (route && route.name) routes.push(route.name);

    if (n === 'DriverProvider' || n === 'useDriverAuth') {
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

  var onHome = false;
  var texts = [];
  var testIds = [];
  var deliveryCardIds = [];
  var driverProviderStates = null;

  function walk(fiber, depth, insideHome) {
    if (!fiber || depth > 600) return;
    var n = fiberName(fiber);
    var inside = insideHome || n === 'HomeScreen';
    if (n === 'HomeScreen') onHome = true;

    if (n === 'DriverProvider') {
      driverProviderStates = readHookStates(fiber);
    }

    var props = fiber.memoizedProps || {};
    if (props.testID) {
      testIds.push(props.testID);
      if (inside && String(props.testID).indexOf('delivery-delivered-') === 0) {
        deliveryCardIds.push(props.testID);
      }
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

  var deliveriesCount = null;
  var driverSnapshot = null;
  var activeFromState = null;
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
        status: driver.status || null,
        isDemo: !!driver.isDemo,
      };
    }
  }

  return JSON.stringify({
    homeScreenMounted: onHome,
    hasHomeTestId: testIds.indexOf('home-screen') >= 0,
    hasDriverStatusBadge: testIds.indexOf('driver-status-badge') >= 0,
    activeDeliveriesSectionVisible: texts.some(function(t) {
      return t === 'Active Deliveries' || t === 'Livraisons actives';
    }),
    deliveryCardCount: deliveryCardIds.length,
    deliveryCardTestIds: deliveryCardIds,
    visibleTexts: texts.slice(0, 40),
    driver: driverSnapshot,
    deliveriesInContext: deliveriesCount,
    activeDeliveriesInContext: activeFromState,
    allTestIdsOnHome: testIds.filter(function(id) {
      return id === 'home-screen' || id.indexOf('delivery-') === 0 || id === 'driver-status-badge';
    }),
  });
})()`;

const PRESS_SUBMIT = `(function(){
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
    if (inForm && props.title && typeof props.onPress === 'function' && !props.loading) {
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
  return JSON.stringify({ pressed: true, title: button.memoizedProps.title });
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

function evaluate(ws, expression) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1e6);
    const timer = setTimeout(() => reject(new Error('Timeout CDP')), 20000);

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
      params: { expression, returnByValue: true },
    }));
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function clearForm(ws) {
  for (const placeholder of Object.values(PLACEHOLDERS)) {
    await evaluate(ws, buildSetFieldExpressionSignUp(placeholder, ''));
  }
  await sleep(100);
}

async function fillForm(ws, data) {
  for (const [key, placeholder] of Object.entries(PLACEHOLDERS)) {
    if (data[key] !== undefined) {
      await evaluate(ws, buildSetFieldExpressionSignUp(placeholder, data[key]));
      await sleep(80);
    }
  }
}

async function fillOnboardingForm(ws, data) {
  for (const [key, placeholder] of Object.entries(ONBOARDING_PLACEHOLDERS)) {
    if (data[key] !== undefined) {
      await evaluate(ws, buildSetFieldExpression('DriverOnboardingScreen', placeholder, data[key]));
      await sleep(80);
    }
  }
}

async function main() {
  const wsUrl = await getWebSocketUrl();
  console.log('WebSocket:', wsUrl);

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.once('open', resolve);
    ws.once('error', reject);
  });

  let nav = await evaluate(ws, NAV_TO_SIGNUP);
  console.log('\n=== Navigation SignUp ===');
  console.log(JSON.stringify(nav, null, 2));
  if (nav.navigated) await sleep(600);

  await clearForm(ws);
  let state = await evaluate(ws, READ_FORM);
  console.log('\n=== 1. État initial (vide) ===');
  console.log(JSON.stringify(state, null, 2));
  if (state.error) {
    ws.close();
    process.exit(1);
  }

  const steps = [];
  let failed = false;

  // 2. Remplissage partiel
  await fillForm(ws, { name: 'Jean Demo', email: 'jean@demo.com' });
  state = await evaluate(ws, READ_FORM);
  const partialOk = state.state.name === 'Jean Demo' && state.state.email === 'jean@demo.com';
  steps.push({ step: 'partial fill', ok: partialOk, state: state.state });
  console.log('\n=== 2. Saisie partielle (nom + email) ===');
  console.log(JSON.stringify(steps[steps.length - 1], null, 2));
  if (!partialOk) failed = true;

  // 3. Mots de passe différents
  await fillForm(ws, { password: 'secret123', confirmPassword: 'other456' });
  state = await evaluate(ws, READ_FORM);
  const mismatchOk = state.state.password === 'secret123'
    && state.state.confirmPassword === 'other456'
    && state.canSubmitExpected === false;
  steps.push({ step: 'password mismatch', ok: mismatchOk, canSubmitExpected: state.canSubmitExpected });
  console.log('\n=== 3. Mots de passe différents ===');
  console.log(JSON.stringify(steps[steps.length - 1], null, 2));
  if (!mismatchOk) failed = true;

  // 4. Formulaire complet valide (email unique à chaque run)
  const uniqueEmail = `hermes.signup.${Date.now()}@demo.com`;
  await fillForm(ws, {
    name: 'Hermes Driver',
    email: uniqueEmail,
    phone: '+33601020304',
    password: 'driver123',
    confirmPassword: 'driver123',
  });
  state = await evaluate(ws, READ_FORM);
  const fullOk = state.canSubmitExpected === true
    && state.state.name === 'Hermes Driver'
    && state.state.email === uniqueEmail
    && state.state.phone === '+33601020304'
    && Object.keys(state.fields).length >= 5;
  steps.push({
    step: 'full valid form',
    ok: fullOk,
    email: uniqueEmail,
    canSubmitExpected: state.canSubmitExpected,
    fieldsFound: Object.keys(state.fields),
    state: state.state,
    submitButton: state.submitButton,
  });
  console.log('\n=== 4. Formulaire complet valide ===');
  console.log(JSON.stringify(steps[steps.length - 1], null, 2));
  if (!fullOk) failed = true;

  // 5. Soumission + inscription locale démo
  const pressed = await evaluate(ws, PRESS_SUBMIT);
  await sleep(800);
  const apiSnapshot = await evaluate(ws, SNAPSHOT_API_CLIENT);
  const navState = await evaluate(ws, READ_NAV_STATE);
  state = await evaluate(ws, READ_FORM);

  const demoSignupOk = apiSnapshot.isDemoToken === true
    && apiSnapshot.userEmail === uniqueEmail
    && apiSnapshot.userName === 'Hermes Driver'
    && apiSnapshot.hasDriver === false;

  const onboardingOk = navState.screens.DriverOnboardingScreen === true
    || navState.routes.indexOf('DriverOnboarding') >= 0
    || navState.auth?.needsOnboarding === true;

  const authenticatedOk = navState.auth?.isAuthenticated === true;
  const noDriverYet = navState.auth?.hasDriver === false;

  const submitOk = pressed.pressed === true
    && authenticatedOk
    && onboardingOk
    && noDriverYet;
  steps.push({
    step: 'submit local demo signup',
    ok: submitOk,
    pressed,
    apiSnapshot: apiSnapshot.error ? apiSnapshot : { ...apiSnapshot, note: 'token lu via Metro si dispo' },
    navState,
    signUpStillVisible: !state.error,
    demoSignupOk: demoSignupOk || (authenticatedOk && onboardingOk),
    onboardingOk,
    authenticatedOk,
  });
  console.log('\n=== 5. Inscription locale démo (submit) ===');
  console.log(JSON.stringify(steps[steps.length - 1], null, 2));
  if (!submitOk) failed = true;

  if (!onboardingOk) {
    steps.push({ step: 'onboarding screen', ok: false, navState });
    failed = true;
  } else {
    steps.push({ step: 'onboarding screen', ok: true, navState });
  }
  console.log('\n=== 6. Écran onboarding / session ===');
  console.log(JSON.stringify(steps[steps.length - 1], null, 2));
  if (!onboardingOk) failed = true;

  // 7. Formulaire onboarding — état initial
  await sleep(400);
  let onboardingState = await evaluate(ws, READ_ONBOARDING_FORM);
  const onboardingVisible = !onboardingState.error;
  steps.push({
    step: 'onboarding form visible',
    ok: onboardingVisible,
    onboardingState: onboardingState.error ? onboardingState : {
      fields: Object.keys(onboardingState.fields || {}),
      state: onboardingState.state,
      submitButton: onboardingState.submitButton,
    },
  });
  console.log('\n=== 7. Formulaire onboarding (initial) ===');
  console.log(JSON.stringify(steps[steps.length - 1], null, 2));
  if (!onboardingVisible) failed = true;

  // 8. Remplissage onboarding
  const onboardingData = {
    licenseNumber: 'HERMES-LIC-001',
    vehicleType: 'bike',
    vehicleModel: 'City Runner',
    licensePlate: 'AB-123-CD',
  };
  await fillOnboardingForm(ws, onboardingData);
  onboardingState = await evaluate(ws, READ_ONBOARDING_FORM);
  const onboardingFillOk = onboardingState.canSubmitExpected === true
    && onboardingState.state.licenseNumber === onboardingData.licenseNumber
    && onboardingState.state.vehicleType === onboardingData.vehicleType
    && onboardingState.state.vehicleModel === onboardingData.vehicleModel
    && onboardingState.state.licensePlate === onboardingData.licensePlate;
  steps.push({
    step: 'onboarding fill',
    ok: onboardingFillOk,
    state: onboardingState.state,
    fieldsFound: Object.keys(onboardingState.fields || {}),
  });
  console.log('\n=== 8. Saisie onboarding ===');
  console.log(JSON.stringify(steps[steps.length - 1], null, 2));
  if (!onboardingFillOk) failed = true;

  // 9. Soumission profil livreur local
  const onboardingPressed = await evaluate(ws, PRESS_ONBOARDING_SUBMIT);
  await sleep(900);
  const navAfterOnboarding = await evaluate(ws, READ_NAV_STATE);
  onboardingState = await evaluate(ws, READ_ONBOARDING_FORM);

  const profileCreated = navAfterOnboarding.auth?.hasDriver === true
    && navAfterOnboarding.auth?.needsOnboarding === false
    && navAfterOnboarding.auth?.isAuthenticated === true;

  const drawerReached = navAfterOnboarding.routes.indexOf('DrawerNavigator') >= 0
    || navAfterOnboarding.screens.DrawerNavigator === true;

  const onboardingSubmitOk = onboardingPressed.pressed === true && profileCreated;
  steps.push({
    step: 'onboarding submit local profile',
    ok: onboardingSubmitOk,
    pressed: onboardingPressed,
    navState: navAfterOnboarding,
    profileCreated,
    drawerReached,
    onboardingStillVisible: !onboardingState.error,
  });
  console.log('\n=== 9. Création profil livreur (démo locale) ===');
  console.log(JSON.stringify(steps[steps.length - 1], null, 2));
  if (!onboardingSubmitOk) failed = true;

  // 10. Accès app principale
  const homeOk = drawerReached || profileCreated;
  steps.push({
    step: 'main app after onboarding',
    ok: homeOk,
    navState: navAfterOnboarding,
  });
  console.log('\n=== 10. App principale ===');
  console.log(JSON.stringify(steps[steps.length - 1], null, 2));
  if (!homeOk) failed = true;

  // 11. Home — attente chargement commandes + snapshot
  await sleep(1800);
  const homeSnapshot = await evaluate(ws, READ_HOME_SNAPSHOT);
  const navHome = await evaluate(ws, READ_NAV_STATE);
  const apiHome = await evaluate(ws, SNAPSHOT_API_CLIENT);

  const homeReady = homeSnapshot.homeScreenMounted === true
    && homeSnapshot.hasHomeTestId === true
    && homeSnapshot.hasDriverStatusBadge === true;

  const activeCount = (homeSnapshot.activeDeliveriesInContext || []).length;
  const noActiveDeliveries = homeSnapshot.activeDeliveriesSectionVisible !== true
    && homeSnapshot.deliveryCardCount === 0
    && activeCount === 0;

  const tokenIsLocalDemo = typeof apiHome.token === 'string'
    && apiHome.token.indexOf('demo_driver_token_') === 0;

  steps.push({
    step: 'home screen visible',
    ok: homeReady,
    home: homeSnapshot.error ? homeSnapshot : {
      hasHomeTestId: homeSnapshot.hasHomeTestId,
      driver: homeSnapshot.driver,
      visibleTexts: homeSnapshot.visibleTexts,
      deliveriesInContext: homeSnapshot.deliveriesInContext,
      activeDeliveriesInContext: homeSnapshot.activeDeliveriesInContext,
      activeDeliveriesSectionVisible: homeSnapshot.activeDeliveriesSectionVisible,
      deliveryCardCount: homeSnapshot.deliveryCardCount,
    },
    nav: navHome,
    api: apiHome.error ? apiHome : {
      tokenPrefix: apiHome.token ? String(apiHome.token).slice(0, 24) + '...' : null,
      tokenIsLocalDemo,
      driverId: apiHome.driverId,
      userEmail: apiHome.userEmail,
    },
  });
  console.log('\n=== 11. Home (snapshot) ===');
  console.log(JSON.stringify(steps[steps.length - 1], null, 2));
  if (!homeReady) failed = true;

  steps.push({
    step: 'fresh account has no active deliveries',
    ok: noActiveDeliveries,
    activeCount,
    activeDeliveriesSectionVisible: homeSnapshot.activeDeliveriesSectionVisible,
    deliveryCardCount: homeSnapshot.deliveryCardCount,
  });
  console.log('\n=== 12. Livraisons actives (compte neuf) ===');
  console.log(JSON.stringify(steps[steps.length - 1], null, 2));
  if (!noActiveDeliveries) failed = true;

  const fullReport = {
    capturedAt: new Date().toISOString(),
    snapshotPath: HOME_SNAPSHOT_PATH,
    email: uniqueEmail,
    passed: steps.filter((s) => s.ok).length,
    total: steps.length,
    failed: steps.filter((s) => !s.ok),
    ok: !failed,
    steps,
    home: homeSnapshot,
    nav: navHome,
    api: apiHome,
  };
  fs.writeFileSync(HOME_SNAPSHOT_PATH, JSON.stringify(fullReport, null, 2));
  console.log(`\nSnapshot Home enregistré: ${HOME_SNAPSHOT_PATH}`);

  console.log('\n=== Résumé ===');
  console.log(JSON.stringify({
    passed: fullReport.passed,
    total: fullReport.total,
    failed: fullReport.failed,
    ok: fullReport.ok,
    homeSnapshot: HOME_SNAPSHOT_PATH,
  }, null, 2));

  ws.close();
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
