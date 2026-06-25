#!/usr/bin/env node
/**
 * Lance tous les tests Hermes E2E en une commande (comme jest).
 *
 * Prérequis :
 *   - Metro actif (expo start)
 *   - App ouverte sur l'appareil / simulateur (n'importe quel écran)
 *
 * Usage :
 *   npm run test:hermes
 *   npm run test:hermes -- --only settings,home-status
 *   npm run test:hermes -- --list
 */

const { spawn } = require('child_process');
const path = require('path');
const { SUITE, resolveScriptPath } = require('./suite');
const { setupHermesTestRuntime } = require('./cdpClient');

const METRO = process.env.METRO_URL || 'http://127.0.0.1:8081';

function parseArgs(argv) {
  const args = { list: false, only: null, help: false, passThrough: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--list') args.list = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else if (arg === '--only') {
      args.only = (argv[i + 1] || '').split(',').map((s) => s.trim()).filter(Boolean);
      i += 1;
    } else if (!arg.startsWith('--')) {
      args.passThrough.push(arg);
    }
  }
  return args;
}

function printHelp() {
  console.log(`Usage: npm run test:hermes [-- options]

Prérequis : Metro + app ouverte (écran libre — les tests naviguent seuls).

Options :
  --list              Liste les tests de la suite
  --only a,b,c        Exécute uniquement ces ids
  --help              Cette aide

Tests disponibles :
${SUITE.map((t) => `  ${t.id.padEnd(22)} ${t.description}`).join('\n')}
`);
}

async function checkMetro() {
  try {
    const res = await fetch(`${METRO}/json/list`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const targets = await res.json();
    const hermes = targets.find((t) => t.webSocketDebuggerUrl);
    if (!hermes) {
      throw new Error('Aucune cible Hermes — ouvrez l\'app sur l\'appareil');
    }
    return hermes;
  } catch (error) {
    throw new Error(
      `Metro/Hermes indisponible (${error.message}). Lancez "npm start" et ouvrez l'app.`
    );
  }
}

function runTest(entry, extraArgs) {
  const scriptPath = resolveScriptPath(entry);
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [scriptPath, ...extraArgs], {
      stdio: 'inherit',
      env: process.env,
    });
    child.on('close', (code) => {
      resolve({ id: entry.id, code: code ?? 1, ok: code === 0 });
    });
    child.on('error', (err) => {
      console.error(`[${entry.id}] spawn error:`, err.message);
      resolve({ id: entry.id, code: 1, ok: false, error: err.message });
    });
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (args.list) {
    SUITE.forEach((t) => {
      console.log(`${t.id}\t${t.description}\tauth=${t.needsAuth}\tnav=${t.autoNavigate}`);
    });
    process.exit(0);
  }

  let selected = SUITE;
  if (args.only?.length) {
    const unknown = args.only.filter((id) => !SUITE.some((t) => t.id === id));
    if (unknown.length) {
      console.error(`Tests inconnus: ${unknown.join(', ')}`);
      console.error(`Utilisez --list pour voir les ids.`);
      process.exit(1);
    }
    selected = args.only.map((id) => SUITE.find((t) => t.id === id));
  }

  console.log('=== Hermes E2E suite ===');
  console.log(`Metro: ${METRO}`);
  console.log(`Tests: ${selected.map((t) => t.id).join(' → ')}\n`);

  const target = await checkMetro();
  console.log(`Cible: ${target.title || target.description || 'Hermes'}\n`);

  const alertPatch = await setupHermesTestRuntime();
  console.log('Alertes RN → auto-OK pour les tests:', JSON.stringify(alertPatch));
  if (alertPatch.error) {
    console.warn('⚠️  Patch alertes non installé — les tests peuvent être bloqués par des Alert');
  }
  console.log('');

  const results = [];
  for (const entry of selected) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`▶ ${entry.id} — ${entry.description}`);
    console.log(`${'─'.repeat(60)}`);
    const result = await runTest(entry, args.passThrough);
    results.push(result);
  }

  const passed = results.filter((r) => r.ok);
  const failed = results.filter((r) => !r.ok);

  console.log(`\n${'═'.repeat(60)}`);
  console.log('=== Résumé suite Hermes ===');
  console.log(JSON.stringify({
    total: results.length,
    passed: passed.length,
    failed: failed.length,
    ok: failed.length === 0,
    details: results.map((r) => ({ id: r.id, ok: r.ok, code: r.code })),
  }, null, 2));

  if (failed.length) {
    console.log(`\nÉchecs: ${failed.map((f) => f.id).join(', ')}`);
    process.exit(1);
  }

  console.log('\n✅ Tous les tests Hermes ont réussi');
  process.exit(0);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
