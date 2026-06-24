#!/usr/bin/env node
/**
 * Teste PaymentMethodsScreen via Hermes CDP — Stripe Connect + PayPal.
 *
 *   node scripts/hermes-payment-methods-test.js
 */

const WebSocket = require('ws');

const METRO = process.env.METRO_URL || 'http://127.0.0.1:8081';

const fiberHelpers = `
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

  function walkAll(fiber, depth, visit) {
    if (!fiber || depth > 700) return;
    visit(fiber, depth);
    walkAll(fiber.child, depth + 1, visit);
    walkAll(fiber.sibling, depth, visit);
  }

  function getRoots(hook) {
    var roots = [];
    hook.renderers.forEach(function(_, rendererID) {
      hook.getFiberRoots(rendererID).forEach(function(root) {
        roots.push(root.current || root);
      });
    });
    return roots;
  }
`;

const NAVIGATE_PAYMENT_METHODS = `(function(){
  ${fiberHelpers}
  var hook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!hook) return JSON.stringify({ error: 'Pas de hook React' });
  var nav = null;
  walkAll(getRoots(hook)[0], 0, function(fiber) {
    var props = fiber.memoizedProps || {};
    if (props.navigation && typeof props.navigation.navigate === 'function') nav = props.navigation;
  });
  if (!nav) return JSON.stringify({ error: 'navigation introuvable' });
  try {
    nav.navigate('Settings', { screen: 'PaymentMethods' });
    return JSON.stringify({ navigated: true });
  } catch (e) {
    return JSON.stringify({ error: String(e) });
  }
})()`;

const READ_SCREEN = `(function(){
  ${fiberHelpers}
  var hook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!hook) return JSON.stringify({ error: 'Pas de hook React' });

  var texts = [];
  var testIds = [];
  var modalVisible = false;
  var modalTitle = null;
  var itemIds = [];
  var masked = [];

  walkAll(getRoots(hook)[0], 0, function(fiber) {
    var props = fiber.memoizedProps || {};
    if (props.testID) testIds.push(props.testID);
    if (fiberName(fiber) === 'Text') {
      var children = props.children;
      if (typeof children === 'string' && children.trim()) texts.push(children.trim());
    }
    if (props.testID === 'payment-method-modal' && props.visible === true) modalVisible = true;
    if (props.testID && props.testID.indexOf('payment-method-item-') === 0) {
      itemIds.push(props.testID.replace('payment-method-item-', ''));
    }
    if (props.testID && props.testID.indexOf('payment-method-masked-') === 0) {
      masked.push({ id: props.testID.replace('payment-method-masked-', ''), text: props.children });
    }
  });

  modalTitle = texts.find(function(t) {
    return /add payout|ajouter un mode|edit payout|modifier le mode/i.test(t);
  }) || null;

  return JSON.stringify({
    screenFound: testIds.indexOf('payment-methods-screen') !== -1,
    stripeCardFound: testIds.indexOf('stripe-connect-card') !== -1,
    stripeButtonFound: testIds.indexOf('stripe-connect-button') !== -1,
    listFound: testIds.indexOf('payment-methods-list') !== -1,
    emptyFound: testIds.indexOf('payment-methods-empty') !== -1,
    loadingFound: testIds.indexOf('payment-methods-loading') !== -1,
    itemCount: itemIds.length,
    itemIds: itemIds,
    masked: masked,
    modalVisible: modalVisible,
    modalTitle: modalTitle,
    hasAddButton: testIds.indexOf('payment-methods-add-button') !== -1,
    texts: texts.slice(0, 80),
  });
})()`;

function pressTestId(testId) {
  return `(function(){
    ${fiberHelpers}
    var hook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!hook) return JSON.stringify({ error: 'Pas de hook React' });
    var pressed = false;
    walkAll(getRoots(hook)[0], 0, function(fiber) {
      var props = fiber.memoizedProps || {};
      if (!pressed && props.testID === ${JSON.stringify(testId)}) {
        if (typeof props.onPress === 'function') { props.onPress(); pressed = true; }
        else if (typeof props.onClick === 'function') { props.onClick(); pressed = true; }
      }
    });
    return JSON.stringify({ pressed: pressed, testID: ${JSON.stringify(testId)} });
  })()`;
}

function typeInTestId(testId, text) {
  return `(function(){
    ${fiberHelpers}
    var hook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!hook) return JSON.stringify({ error: 'Pas de hook React' });
    var input = null;
    walkAll(getRoots(hook)[0], 0, function(fiber) {
      if (fiber.memoizedProps && fiber.memoizedProps.testID === ${JSON.stringify(testId)}) input = fiber;
    });
    if (!input) return JSON.stringify({ error: 'Input introuvable', testID: ${JSON.stringify(testId)} });
    input.memoizedProps.onChangeText(${JSON.stringify(text)});
    return JSON.stringify({ typed: ${JSON.stringify(text)}, testID: ${JSON.stringify(testId)} });
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
      params: { expression, returnByValue: true, awaitPromise: true },
    }));
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function pollUntil(ws, readFn, predicate, maxMs = 10000) {
  const started = Date.now();
  let last = null;
  while (Date.now() - started < maxMs) {
    last = await readFn();
    if (predicate(last)) return { ok: true, state: last, ms: Date.now() - started };
    await sleep(300);
  }
  return { ok: false, state: last, ms: Date.now() - started };
}

async function main() {
  const wsUrl = await getWebSocketUrl();
  console.log('WebSocket:', wsUrl);
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.once('open', resolve);
    ws.once('error', reject);
  });

  const results = [];

  console.log('\n=== 1. Navigation Payment Methods ===');
  const nav = await evaluate(ws, NAVIGATE_PAYMENT_METHODS);
  console.log(JSON.stringify(nav, null, 2));
  results.push({ step: 'navigate', ok: nav.navigated === true, detail: nav });

  const loaded = await pollUntil(
    ws,
    () => evaluate(ws, READ_SCREEN),
    (s) => s.screenFound && s.stripeCardFound && !s.loadingFound
  );
  console.log('\n=== 2. Écran chargé (Stripe Connect) ===');
  console.log(JSON.stringify(loaded.state, null, 2));
  results.push({
    step: 'screenLoaded',
    ok: loaded.ok && loaded.state.stripeButtonFound,
    detail: loaded.state,
  });

  console.log('\n=== 3. Clic Stripe Connect ===');
  const connectPress = await evaluate(ws, pressTestId('stripe-connect-button'));
  console.log(JSON.stringify(connectPress, null, 2));
  const afterConnect = await pollUntil(
    ws,
    () => evaluate(ws, READ_SCREEN),
    (s) => s.listFound && s.itemCount >= 1,
    12000
  );
  console.log('Après Connect:', JSON.stringify(afterConnect.state, null, 2));
  const hasBankMasked = (afterConnect.state?.masked || []).some((m) =>
    String(m.text).includes('7890') || String(m.text).includes('IBAN')
  );
  results.push({
    step: 'stripeConnect',
    ok: connectPress.pressed && afterConnect.ok && hasBankMasked,
    detail: { itemCount: afterConnect.state?.itemCount, masked: afterConnect.state?.masked },
  });

  console.log('\n=== 4. Clic Add PayPal (+) ===');
  const addPress = await evaluate(ws, pressTestId('payment-methods-add-button'));
  const modalOpen = await pollUntil(ws, () => evaluate(ws, READ_SCREEN), (s) => s.modalVisible === true);
  console.log('Modal:', JSON.stringify(modalOpen.state, null, 2));
  results.push({ step: 'openPaypalModal', ok: addPress.pressed && modalOpen.ok });

  console.log('\n=== 5. Remplir PayPal ===');
  const typeResult = await evaluate(ws, typeInTestId('payment-form-paypal-email', 'driver.paypal@demo.com'));
  console.log(JSON.stringify(typeResult, null, 2));
  results.push({ step: 'typePaypalEmail', ok: typeResult.typed === 'driver.paypal@demo.com' });

  console.log('\n=== 6. Submit PayPal ===');
  const submit = await evaluate(ws, pressTestId('payment-modal-submit'));
  const afterPaypal = await pollUntil(
    ws,
    () => evaluate(ws, READ_SCREEN),
    (s) => !s.modalVisible && s.itemCount >= 2,
    12000
  );
  console.log('Après PayPal:', JSON.stringify(afterPaypal.state, null, 2));
  results.push({
    step: 'addPaypal',
    ok: submit.pressed && afterPaypal.ok,
    detail: { itemCount: afterPaypal.state?.itemCount },
  });

  const paypalId = afterPaypal.state?.itemIds?.find((id) => String(id).includes('demo_pm'));
  if (paypalId) {
    console.log(`\n=== 7. Set default PayPal (${paypalId}) ===`);
    await evaluate(ws, pressTestId(`payment-method-default-${paypalId}`));
    await sleep(800);
    results.push({ step: 'setDefaultPaypal', ok: true });
  }

  console.log('\n=== Résumé ===');
  const summary = results.map((r) => ({ step: r.step, ok: r.ok }));
  console.log(JSON.stringify(summary, null, 2));

  const failures = results.filter((r) => !r.ok);
  if (failures.length) {
    console.log('\n❌ Échecs:', failures.map((f) => f.step).join(', '));
    ws.close();
    process.exit(1);
  }

  console.log('\n✅ Payment Methods OK');
  ws.close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
