const path = require('path');

const SCRIPTS_DIR = path.join(__dirname, '..');

/**
 * Suite Hermes E2E — ordre intentionnel.
 * Chaque test gère sa navigation / son auth sauf indication contraire.
 */
const SUITE = [
  {
    id: 'demo-logout-signup',
    file: 'hermes-demo-logout-signup-test.js',
    description: 'Login démo → logout → SignUp → livraisons actives',
    needsAuth: false,
    autoNavigate: true,
  },
  {
    id: 'home-status',
    file: 'hermes-home-status-test.js',
    description: 'Home — boutons statut (compte SignUp local)',
    needsAuth: false,
    autoNavigate: true,
  },
  {
    id: 'settings',
    file: 'hermes-settings-test.js',
    description: 'Settings — sections, switches',
    needsAuth: true,
    autoNavigate: true,
  },
  {
    id: 'payment-methods',
    file: 'hermes-payment-methods-test.js',
    description: 'Payment methods — Stripe Connect / PayPal',
    needsAuth: true,
    autoNavigate: true,
  },
  {
    id: 'support-form',
    file: 'hermes-support-form-test.js',
    description: 'Support — formulaire bug report',
    needsAuth: true,
    autoNavigate: true,
  },
  {
    id: 'signup-form',
    file: 'hermes-signup-form-test.js',
    description: 'SignUp + onboarding + Home',
    needsAuth: false,
    autoNavigate: true,
  },
];

const resolveScriptPath = (entry) => path.join(SCRIPTS_DIR, entry.file);

const getById = (id) => SUITE.find((t) => t.id === id);

module.exports = {
  SUITE,
  SCRIPTS_DIR,
  resolveScriptPath,
  getById,
};
