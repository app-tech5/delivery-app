#!/usr/bin/env node
/**
 * WebSocket → Hermes (JSON / CDP).
 *
 *   node scripts/hermes-cdp.js
 *   node scripts/hermes-cdp.js react map
 *   node scripts/hermes-cdp.js react list
 *   node scripts/hermes-cdp.js react open restaurant-<id>
 *   node scripts/hermes-cdp.js react support
 *   node scripts/hermes-cdp.js react measure restaurant-<id>
 *
 * Par défaut : evaluate SANS Runtime.enable (évite le replay des logs console).
 * Pour activer le domaine Runtime : ENABLE_RUNTIME=1 node scripts/hermes-cdp.js
 */

const WebSocket = require('ws');
const {
  buildReactInspectExpression,
  buildOpenCalloutExpression,
  buildSupportTreeExpression,
  buildMapSelectionPanelExpression,
} = require('./hermes-react-inspect');
const {
  buildKickMeasureExpression,
  buildPollMeasureExpression,
} = require('./hermes-react-measure');

const METRO = process.env.METRO_URL || 'http://127.0.0.1:8081';
const SHOW_EVENTS = process.env.SHOW_EVENTS === '1';

async function getWebSocketUrl() {
  const res = await fetch(`${METRO}/json/list`);
  const targets = await res.json();
  const target =
    targets.find((t) => t.description?.includes('Bridgeless')) || targets[0];
  if (!target?.webSocketDebuggerUrl) {
    throw new Error('Pas de cible Hermes. App ouverte + Metro actif ?');
  }
  return target;
}

function sendJson(ws, message) {
  const line = JSON.stringify(message);
  console.log('→', line);
  ws.send(line);
}

let evalId = 1000;

async function evaluateHermes(ws, expression, { awaitPromise = false } = {}) {
  return new Promise((resolve, reject) => {
    const id = ++evalId;
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
      if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
        resolve(JSON.parse(val));
        return;
      }
      resolve(msg.result?.result ?? msg.result);
    };

    ws.on('message', onMessage);
    ws.send(
      JSON.stringify({
        id,
        method: 'Runtime.evaluate',
        params: { expression, returnByValue: true, awaitPromise },
      })
    );
  });
}

async function main() {
  const target = await getWebSocketUrl();
  console.log('WebSocket:', target.webSocketDebuggerUrl);

  const ws = new WebSocket(target.webSocketDebuggerUrl);

  await new Promise((resolve, reject) => {
    ws.once('open', resolve);
    ws.once('error', reject);
  });

  const arg = process.argv[2];

  if (arg === 'react' && process.argv[3] === 'measure' && process.argv[4]) {
    const markerId = process.argv[4];
    console.log('→ open callout via Hermes…');
    const opened = await evaluateHermes(ws, buildOpenCalloutExpression(markerId));
    console.log('←', JSON.stringify(opened, null, 2));
    await new Promise((r) => setTimeout(r, 1200));
    console.log('→ measure écran (marker vs callout)…');
    await evaluateHermes(ws, buildKickMeasureExpression(markerId));
    let result = { status: 'pending' };
    for (let i = 0; i < 25 && result.status === 'pending'; i += 1) {
      await new Promise((r) => setTimeout(r, 200));
      result = await evaluateHermes(ws, buildPollMeasureExpression());
    }
    console.log('←', JSON.stringify(result, null, 2));
    ws.close();
    process.exit(0);
  }

  let nextId = 1;
  let pendingResponses = 0;
  let exitTimer = null;

  function scheduleExit() {
    if (exitTimer) clearTimeout(exitTimer);
    exitTimer = setTimeout(() => {
      ws.close();
      process.exit(0);
    }, 300);
  }

  setTimeout(() => {
    console.error('Timeout: pas de réponse Hermes');
    ws.close();
    process.exit(1);
  }, 20000);

  function printEvaluateResult(msg) {
    const val = msg.result?.result?.value;
    if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
      try {
        console.log('←', JSON.stringify(JSON.parse(val), null, 2));
        return;
      } catch {
        // fall through
      }
    }
    console.log('←', JSON.stringify(msg.result, null, 2));
  }

  ws.on('message', (data) => {
    const text = data.toString();
    let msg;
    try {
      msg = JSON.parse(text);
    } catch {
      console.log('←', text);
      return;
    }

    if (msg.id != null) {
      if (msg.result?.exceptionDetails) {
        console.log('← ERREUR', JSON.stringify(msg.result.exceptionDetails, null, 2));
      } else {
        printEvaluateResult(msg);
      }
      pendingResponses -= 1;
      if (pendingResponses <= 0) scheduleExit();
      return;
    }

    if (SHOW_EVENTS) {
      console.log('←', text);
    }
  });

  function send(message) {
    if (!message.id) {
      message.id = nextId++;
    }
    pendingResponses += 1;
    sendJson(ws, message);
  }

  const arg2 = process.argv[2];

  if (arg2 === 'react') {
    const sub = process.argv[3] || 'map';
    const markerId = process.argv[4];

    if (sub === 'open' || sub === 'tap') {
      if (!markerId) throw new Error('Usage: react open restaurant-<id>');
      send({
        method: 'Runtime.evaluate',
        params: { expression: buildOpenCalloutExpression(markerId), returnByValue: true },
      });
      return;
    }

    if (sub === 'support') {
      send({
        method: 'Runtime.evaluate',
        params: {
          expression: buildSupportTreeExpression(),
          returnByValue: true,
        },
      });
      return;
    }

    if (sub === 'map-selection') {
      send({
        method: 'Runtime.evaluate',
        params: {
          expression: buildMapSelectionPanelExpression(),
          returnByValue: true,
          awaitPromise: true,
        },
      });
      return;
    }

    send({
      method: 'Runtime.evaluate',
      params: {
        expression: buildReactInspectExpression(sub),
        returnByValue: true,
      },
    });
    return;
  }

  if (arg2) {
    send(JSON.parse(arg));
  } else {
    if (process.env.ENABLE_RUNTIME === '1') {
      send({ method: 'Runtime.discardConsoleEntries', params: {} });
      send({ method: 'Runtime.enable', params: {} });
    }
    send({
      method: 'Runtime.evaluate',
      params: { expression: 'typeof __DEV__', returnByValue: true },
    });
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
