#!/usr/bin/env node
/**
 * Teste SettingsScreen via Hermes CDP.
 * Navigue vers Settings, inspecte l'arbre React, teste un switch et le thème.
 *
 *   node scripts/hermes-settings-test.js
 */

const WebSocket = require('ws');

const METRO = process.env.METRO_URL || 'http://127.0.0.1:8081';

const NAVIGATE_SETTINGS = `(function(){
  var hook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!hook) return JSON.stringify({ error: 'Pas de hook React' });

  var nav = null;

  function walk(fiber, depth) {
    if (!fiber || depth > 600) return;
    var props = fiber.memoizedProps || {};
    if (props.navigation && typeof props.navigation.navigate === 'function') {
      nav = props.navigation;
    }
    walk(fiber.child, depth + 1);
    walk(fiber.sibling, depth);
  }

  hook.renderers.forEach(function(_, rendererID) {
    hook.getFiberRoots(rendererID).forEach(function(root) {
      walk(root.current || root, 0);
    });
  });

  if (!nav) return JSON.stringify({ error: 'navigation introuvable' });
  try {
    nav.navigate('Settings');
    return JSON.stringify({ navigated: true, route: 'Settings' });
  } catch (e) {
    return JSON.stringify({ error: String(e) });
  }
})()`;

const READ_SETTINGS_STATE = `(function(){
  var hook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!hook) return JSON.stringify({ error: 'Pas de hook React' });

  function fiberName(fiber) {
    if (!fiber || !fiber.type) return '';
    var t = fiber.type;
    if (typeof t === 'string') return t;
    if (t && typeof t === 'object' && t.type) {
      var inner = t.type;
      return inner.displayName || inner.name || 'Memo';
    }
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

  var settingsScreen = null;
  var texts = [];
  var switches = [];
  var buttons = [];
  var sections = { GeneralSettings: 0, NotificationSettings: 0, PrivacySettings: 0, DataSettings: 0, PaymentSettings: 0, SettingsActions: 0 };

  function walkTexts(fiber, depth) {
    if (!fiber || depth > 400) return;
    if (fiberName(fiber) === 'Text') {
      var children = fiber.memoizedProps && fiber.memoizedProps.children;
      if (typeof children === 'string' && children.trim()) {
        texts.push(children.trim());
      }
    }
    walkTexts(fiber.child, depth + 1);
    walkTexts(fiber.sibling, depth);
  }

  function walk(fiber, depth, insideSettings) {
    if (!fiber || depth > 600) return;
    var name = fiberName(fiber);
    var inside = insideSettings || name === 'SettingsScreen';
    if (name === 'SettingsScreen') settingsScreen = fiber;
    if (inside && sections[name] != null) sections[name] += 1;

    var props = fiber.memoizedProps || {};
    if (inside && typeof props.onValueChange === 'function') {
      switches.push({ value: props.value, disabled: !!props.disabled });
    }
    if (inside && typeof props.title === 'string' && typeof props.onPress === 'function') {
      buttons.push({ title: props.title });
    }

    walk(fiber.child, depth + 1, inside);
    walk(fiber.sibling, depth, inside);
  }

  hook.renderers.forEach(function(_, rendererID) {
    hook.getFiberRoots(rendererID).forEach(function(root) {
      walk(root.current || root, 0, false);
    });
  });

  if (!settingsScreen) {
    return JSON.stringify({
      error: 'SettingsScreen introuvable — ouvrez Settings ou relancez le script',
      sections: sections,
      sampleTexts: texts.slice(0, 20),
    });
  }

  walkTexts(settingsScreen, 0);

  return JSON.stringify({
    screenFound: true,
    sections: sections,
    switchCount: switches.length,
    switches: switches.slice(0, 12),
    buttonCount: buttons.length,
    buttons: buttons.slice(0, 10),
    textCount: texts.length,
    texts: texts.slice(0, 40),
    screenLayoutTitle: texts.find(function(t) { return /settings/i.test(t); }) || null,
  });
})()`;

const TOGGLE_FIRST_SWITCH = `(function(){
  var hook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!hook) return JSON.stringify({ error: 'Pas de hook React' });

  var target = null;

  function walk(fiber, depth, inside) {
    if (!fiber || depth > 600) return;
    var insideSettings = inside || fiberName(fiber) === 'SettingsScreen';
    var props = fiber.memoizedProps || {};
    if (insideSettings && typeof props.onValueChange === 'function' && !props.disabled) {
      target = props;
      return;
    }
    walk(fiber.child, depth + 1, insideSettings);
    if (!target) walk(fiber.sibling, depth, inside);
  }

  function fiberName(fiber) {
    if (!fiber || !fiber.type) return '';
    var t = fiber.type;
    if (typeof t === 'string') return t;
    return t.displayName || t.name || '';
  }

  hook.renderers.forEach(function(_, rendererID) {
    hook.getFiberRoots(rendererID).forEach(function(root) {
      walk(root.current || root, 0, false);
    });
  });

  if (!target) return JSON.stringify({ error: 'Switch introuvable' });
  var before = !!target.value;
  try {
    target.onValueChange(!before);
    return JSON.stringify({ toggled: true, before: before, after: !before });
  } catch (e) {
    return JSON.stringify({ error: String(e), before: before });
  }
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
    const timer = setTimeout(() => reject(new Error('Timeout CDP')), 15000);

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

async function main() {
  const wsUrl = await getWebSocketUrl();
  console.log('WebSocket:', wsUrl);

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.once('open', resolve);
    ws.once('error', reject);
  });

  console.log('\n=== Navigation → Settings ===');
  const nav = await evaluate(ws, NAVIGATE_SETTINGS);
  console.log(JSON.stringify(nav, null, 2));

  await sleep(800);

  console.log('\n=== État SettingsScreen ===');
  const state = await evaluate(ws, READ_SETTINGS_STATE);
  console.log(JSON.stringify(state, null, 2));

  if (state.error) {
    ws.close();
    process.exit(1);
  }

  console.log('\n=== Toggle premier switch ===');
  const toggle = await evaluate(ws, TOGGLE_FIRST_SWITCH);
  console.log(JSON.stringify(toggle, null, 2));

  await sleep(300);

  const afterToggle = await evaluate(ws, READ_SETTINGS_STATE);
  const checks = {
    screenFound: state.screenFound === true,
    hasGeneralSection: (state.sections?.GeneralSettings || 0) > 0,
    hasNotificationSection: (state.sections?.NotificationSettings || 0) > 0,
    hasPrivacySection: (state.sections?.PrivacySettings || 0) > 0,
    hasDataSection: (state.sections?.DataSettings || 0) > 0,
    hasPaymentSection: (state.sections?.PaymentSettings || 0) > 0,
    hasActions: (state.sections?.SettingsActions || 0) > 0,
    switchesPresent: (state.switchCount || 0) >= 6,
    toggleWorks: toggle.toggled === true && !toggle.error,
    textsPresent: (state.textCount || 0) > 10,
  };

  console.log('\n=== Vérifications ===');
  console.log(JSON.stringify(checks, null, 2));

  const failed = Object.entries(checks).filter(([, ok]) => !ok);
  if (failed.length) {
    console.log('\n❌ Échecs:', failed.map(([k]) => k).join(', '));
  } else {
    console.log('\n✅ SettingsScreen OK');
  }

  ws.close();
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
