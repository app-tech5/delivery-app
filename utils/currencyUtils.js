/**
 * Valeurs par défaut pour les devises
 */
export const DEFAULT_CURRENCY = { symbol: '€', code: 'EUR' };

/**
 * Liste des devises supportées
 */
export const SUPPORTED_CURRENCIES = [
  { key: 'EUR', label: 'Euro (€)', symbol: '€' },
  { key: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { key: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { key: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' }
];

/**
 * Formate un montant avec la devise
 * @param {number} amount - Montant à formater
 * @param {Object|string} currency - Objet devise ou symbole
 * @returns {string} Montant formaté
 */
export const formatCurrency = (amount, currency = null) => {
  const currencyObj = currency || DEFAULT_CURRENCY;
  const symbol = typeof currencyObj === 'string' ? currencyObj : currencyObj?.symbol || '€';
  return `${amount?.toFixed(2) || '0.00'}${symbol}`;
};

/**
 * Obtient la devise par défaut ou celle des paramètres
 * @param {Object} settings - Objet des paramètres
 * @returns {Object} Devise
 */
export const getCurrency = (settings) => {
  return settings?.currency || DEFAULT_CURRENCY;
};

/**
 * Obtient le symbole de devise
 * @param {Object|string} currency - Objet devise ou symbole
 * @returns {string} Symbole de devise
 */
export const getCurrencySymbol = (currency) => {
  if (typeof currency === 'string') return currency;
  return currency?.symbol || DEFAULT_CURRENCY.symbol;
};

/**
 * Obtient le code de devise
 * @param {Object|string} currency - Objet devise ou code
 * @returns {string} Code de devise
 */
export const getCurrencyCode = (currency) => {
  if (typeof currency === 'string') return currency;
  return currency?.code || DEFAULT_CURRENCY.code;
};

/**
 * Trouve une devise par son code
 * @param {string} code - Code de devise
 * @returns {Object|null} Objet devise ou null
 */
export const findCurrencyByCode = (code) => {
  return SUPPORTED_CURRENCIES.find(currency => currency.key === code) || null;
};

/**
 * Valide si une devise est supportée
 * @param {string} code - Code de devise à valider
 * @returns {boolean} True si supportée
 */
export const isCurrencySupported = (code) => {
  return SUPPORTED_CURRENCIES.some(currency => currency.key === code);
};
