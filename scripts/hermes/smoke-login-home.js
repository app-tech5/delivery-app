#!/usr/bin/env node
/**
 * Hermes CDP smoke: live API driver login → Home.
 * Requires: Metro + debug app open (emulator/device).
 *
 *   METRO_URL=http://127.0.0.1:8081 node scripts/hermes/smoke-login-home.js
 */

const { connectHermes, evaluate, installAutoOkAlerts } = require('./cdpClient');
const { buildNavigateHomeExpression } = require('./navHelpers');

const EMAIL = process.env.E2E_EMAIL || 'driver@demo.com';
const PASSWORD = process.env.E2E_PASSWORD || 'driver123';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function evaluateJson(ws, expression, { timeoutMs = 30000 } = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1e6);
    const timer = setTimeout(() => reject(new Error(`Timeout CDP (${timeoutMs}ms)`)), timeoutMs);

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
        try {
          resolve(JSON.parse(val));
        } catch {
          resolve(val);
        }
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

async function runAsyncViaPoll(ws, buildAsyncBody, { timeoutMs = 90000, pollMs = 1000 } = {}) {
  const key = `__HERMES_E2E_POLL_${Date.now()}__`;
  const keyLit = JSON.stringify(key);
  const asyncBody = buildAsyncBody(keyLit);
  await evaluateJson(ws, `(function(){
    globalThis[${keyLit}] = { pending: true };
    (async function(){
      try {
        ${asyncBody}
      } catch (e) {
        globalThis[${keyLit}] = { ok: false, error: String(e && e.message || e) };
      }
    })();
    return JSON.stringify({ started: true });
  })()`);

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await sleep(pollMs);
    const state = await evaluateJson(ws, `JSON.stringify(globalThis[${keyLit}] || null)`);
    if (state && state.pending !== true) return state;
  }
  throw new Error(`Timeout waiting for async CDP result (${timeoutMs}ms)`);
}

const READ_HOME_STATE = `(function(){
  function fiberName(fiber) {
    if (!fiber || !fiber.type) return '';
    var t = fiber.type;
    if (typeof t === 'string') return t;
    return t.displayName || t.name || (t.render && t.render.displayName) || '';
  }
  function walk(fiber, depth, ctx) {
    if (!fiber || depth > 800) return;
    var n = fiberName(fiber);
    var props = fiber.memoizedProps || {};
    if (n === 'HomeScreen' || n === 'Home') ctx.onHome = true;
    if (typeof props.children === 'string') {
      var text = props.children.trim();
      if (text.indexOf('Sign In') >= 0 || text.indexOf('Connexion') >= 0) ctx.seesSignIn = true;
      if (text.indexOf('Online') >= 0 || text.indexOf('Offline') >= 0 || text.indexOf('En ligne') >= 0 || text.indexOf('Hors ligne') >= 0) ctx.hasStatus = true;
      if (text.indexOf('Earnings') >= 0 || text.indexOf('Gains') >= 0) ctx.hasEarnings = true;
    }
    walk(fiber.child, depth + 1, ctx);
    walk(fiber.sibling, depth, ctx);
  }
  var hook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!hook) return JSON.stringify({ error: 'Pas de hook React DevTools' });
  var ctx = {
    onHome: false,
    hasStatus: false,
    hasEarnings: false,
    seesSignIn: false,
  };
  hook.renderers.forEach(function(_, rendererID) {
    hook.getFiberRoots(rendererID).forEach(function(root) {
      walk(root.current || root, 0, ctx);
    });
  });
  return JSON.stringify(ctx);
})()`;

async function main() {
  const ws = await connectHermes();
  await installAutoOkAlerts(ws);

  console.log('→ Hermes driver login via live API…');
  const login = await runAsyncViaPoll(ws, (keyLit) => `
    if (typeof globalThis.__HERMES_E2E_LOGIN__ !== 'function') {
      throw new Error('login hook missing — rebuild debug app with hermesE2eHooks');
    }
    var result = await globalThis.__HERMES_E2E_LOGIN__(${JSON.stringify(EMAIL)}, ${JSON.stringify(PASSWORD)});
    globalThis[${keyLit}] = result;
  `, { timeoutMs: 90000 });
  console.log('login:', login);
  if (!login || login.ok !== true) {
    ws.close();
    console.error('❌ Login failed', login);
    process.exit(1);
  }

  await sleep(2500);
  const nav = await evaluate(ws, buildNavigateHomeExpression());
  console.log('navigate home:', nav);
  await sleep(3500);

  let state = await evaluate(ws, READ_HOME_STATE);
  console.log('home state:', state);

  for (let i = 0; i < 8 && state && !state.onHome; i += 1) {
    await sleep(1500);
    state = await evaluate(ws, READ_HOME_STATE);
    console.log(`home state retry ${i + 1}:`, state);
  }

  ws.close();

  const failures = [];
  if (state?.error) failures.push(state.error);
  if (!state?.onHome) failures.push('Home screen not mounted after login');
  if (state?.seesSignIn) failures.push('Still seeing Sign In after login');

  if (failures.length) {
    console.error('\n❌ Hermes login→home smoke failed:');
    failures.forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
  }

  console.log('\n✅ Hermes driver login→home smoke passed (live API)');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
