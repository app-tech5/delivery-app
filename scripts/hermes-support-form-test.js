#!/usr/bin/env node
/**
 * Teste l'état du bouton Send Report sur SupportScreen via Hermes CDP.
 * Simule plusieurs saisies et mesure le délai avant disabled=false.
 *
 *   node scripts/hermes-support-form-test.js
 *   node scripts/hermes-support-form-test.js --attempts 5
 */

const WebSocket = require('ws');

const METRO = process.env.METRO_URL || 'http://127.0.0.1:8081';
const ATTEMPTS = Number(process.argv.includes('--attempts')
  ? process.argv[process.argv.indexOf('--attempts') + 1]
  : 5);

const READ_FORM_STATE = `(function(){
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

  function isFormSection(fiber) {
    var n = fiberName(fiber);
    return n === 'BugReportForm' || n === 'DescriptionSubmit' || n.indexOf('BugReportForm') !== -1;
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

  var formFiber = null;
  var descriptionFiber = null;
  var textInput = null;
  var buttonNode = null;

  function walk(fiber, depth, insideForm) {
    if (!fiber || depth > 500) return;
    var inside = insideForm || isFormSection(fiber);
    var props = fiber.memoizedProps || {};
    if (fiberName(fiber) === 'BugReportForm') formFiber = fiber;
    if (fiberName(fiber) === 'DescriptionSubmit') descriptionFiber = fiber;

    if (inside) {
      if (props.testID === 'support-bug-description' && typeof props.onChangeText === 'function') {
        textInput = fiber;
      }
      if (props.testID === 'support-send-report') {
        buttonNode = fiber;
      }
    }

    walk(fiber.child, depth + 1, inside);
    walk(fiber.sibling, depth, inside);
  }

  hook.renderers.forEach(function(_, rendererID) {
    hook.getFiberRoots(rendererID).forEach(function(root) {
      walk(root.current || root, 0, false);
    });
  });

  if (!formFiber && !descriptionFiber) {
    return JSON.stringify({ error: 'BugReportForm introuvable — ouvrez SupportScreen' });
  }

  var formStates = formFiber ? readUseState(formFiber) : [];
  var descriptionStates = descriptionFiber ? readUseState(descriptionFiber) : [];
  var category = formStates[0] || 'general';
  var priority = formStates[1] || 'normal';
  var description = typeof descriptionStates[0] === 'string'
    ? descriptionStates[0]
    : (textInput && textInput.memoizedProps ? textInput.memoizedProps.value || '' : '');
  var buttonProps = buttonNode && buttonNode.memoizedProps ? buttonNode.memoizedProps : null;
  var buttonDisabled = buttonProps ? !!buttonProps.disabled : null;
  var accessibilityDisabled = buttonProps && buttonProps.accessibilityState
    ? !!buttonProps.accessibilityState.disabled
    : null;

  return JSON.stringify({
    form: { category: category, priority: priority, description: description },
    descriptionLength: description.length,
    canSubmitExpected: description.trim().length > 0,
    buttonFound: !!buttonNode,
    buttonComponent: buttonNode ? fiberName(buttonNode) : null,
    buttonDisabled: buttonDisabled,
    accessibilityDisabled: accessibilityDisabled,
    textInputFound: !!textInput,
    textInputValue: textInput && textInput.memoizedProps ? textInput.memoizedProps.value : null,
    submittingProp: (formFiber && formFiber.memoizedProps) ? formFiber.memoizedProps.submitting : null,
  });
})()`;

const TYPE_TEXT = (text) => `(function(){
  var hook = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!hook) return JSON.stringify({ error: 'Pas de hook React' });

  var textInput = null;

  function walk(fiber, depth) {
    if (!fiber || depth > 500) return;
    if (fiber.memoizedProps && fiber.memoizedProps.testID === 'support-bug-description') {
      textInput = fiber;
    }
    walk(fiber.child, depth + 1);
    walk(fiber.sibling, depth);
  }

  hook.renderers.forEach(function(_, rendererID) {
    hook.getFiberRoots(rendererID).forEach(function(root) {
      walk(root.current || root, 0);
    });
  });

  if (!textInput) return JSON.stringify({ error: 'TextInput introuvable' });
  textInput.memoizedProps.onChangeText(${JSON.stringify(text)});
  return JSON.stringify({ typed: ${JSON.stringify(text)} });
})()`;

const CLEAR_TEXT = TYPE_TEXT('');

async function getWebSocketUrl() {
  const res = await fetch(`${METRO}/json/list`);
  const targets = await res.json();
  const target = targets.find((t) => t.description?.includes('Bridgeless')) || targets[0];
  if (!target?.webSocketDebuggerUrl) {
    throw new Error('Pas de cible Hermes. App ouverte sur SupportScreen + Metro actif ?');
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

async function pollUntilEnabled(ws, maxMs) {
  const delays = [0, 16, 32, 50, 100, 150, 250, 400, 600, 1000, 1500, 2000];
  const started = Date.now();
  let last = null;

  for (const delay of delays) {
    if (delay > 0) await sleep(delay);
    if (Date.now() - started > maxMs) break;
    last = await evaluate(ws, READ_FORM_STATE);
    if (last.buttonDisabled === false) {
      return { enabled: true, ms: Date.now() - started, state: last };
    }
  }

  return { enabled: false, ms: Date.now() - started, state: last };
}

async function main() {
  const wsUrl = await getWebSocketUrl();
  console.log('WebSocket:', wsUrl);

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.once('open', resolve);
    ws.once('error', reject);
  });

  await evaluate(ws, CLEAR_TEXT);
  await sleep(150);

  const initial = await evaluate(ws, READ_FORM_STATE);
  console.log('\n=== État initial ===');
  console.log(JSON.stringify(initial, null, 2));

  if (initial.error) {
    ws.close();
    process.exit(1);
  }

  const results = [];

  for (let i = 1; i <= ATTEMPTS; i += 1) {
    await evaluate(ws, CLEAR_TEXT);
    await sleep(100);

    const char = String.fromCharCode(64 + i);
    await evaluate(ws, TYPE_TEXT(char));

    const poll = await pollUntilEnabled(ws, 2500);
    results.push({
      attempt: i,
      char,
      enabled: poll.enabled,
      msToEnable: poll.enabled ? poll.ms : null,
      finalState: {
        descriptionLength: poll.state?.descriptionLength,
        buttonDisabled: poll.state?.buttonDisabled,
        buttonComponent: poll.state?.buttonComponent,
        canSubmitExpected: poll.state?.canSubmitExpected,
      },
    });

    console.log(`\n=== Essai ${i} (typed "${char}") ===`);
    console.log(JSON.stringify(results[results.length - 1], null, 2));
  }

  const word = 'hello';
  await evaluate(ws, CLEAR_TEXT);
  await sleep(100);
  await evaluate(ws, TYPE_TEXT(word));
  const afterWord = await pollUntilEnabled(ws, 500);
  console.log('\n=== Saisie mot complet "hello" ===');
  console.log(JSON.stringify({
    enabled: afterWord.enabled,
    msToEnable: afterWord.ms,
    state: afterWord.state,
  }, null, 2));

  const summary = {
    attempts: results.length,
    enabledCount: results.filter((r) => r.enabled).length,
    avgMs: results.filter((r) => r.enabled).reduce((s, r) => s + r.msToEnable, 0)
      / (results.filter((r) => r.enabled).length || 1),
    maxMs: Math.max(...results.filter((r) => r.enabled).map((r) => r.msToEnable), 0),
    failures: results.filter((r) => !r.enabled),
  };

  console.log('\n=== Résumé ===');
  console.log(JSON.stringify(summary, null, 2));

  ws.close();
  process.exit(summary.failures.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
