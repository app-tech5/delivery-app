
export const DEFAULT_CURRENCY = { symbol: '€', code: 'EUR' };

export const SUPPORTED_CURRENCIES = [
  { key: 'EUR', label: 'Euro (€)', symbol: '€' },
  { key: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { key: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { key: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' }
];

export const formatCurrency = (amount, currency = null) => {
  const value = Number(amount);
  const safeAmount = Number.isFinite(value) ? value : 0;
  const currencyObj = currency || DEFAULT_CURRENCY;
  const symbol = typeof currencyObj === 'string' ? currencyObj : currencyObj?.symbol || '€';
  return `${safeAmount.toFixed(2)}${symbol}`;
};

export const getCurrency = (settings) => {
  return settings?.currency || DEFAULT_CURRENCY;
};

export const getCurrencySymbol = (currency) => {
  if (typeof currency === 'string') return currency;
  return currency?.symbol || DEFAULT_CURRENCY.symbol;
};

export const getCurrencyCode = (currency) => {
  if (typeof currency === 'string') return currency;
  return currency?.code || DEFAULT_CURRENCY.code;
};

export const findCurrencyByCode = (code) => {
  return SUPPORTED_CURRENCIES.find(currency => currency.key === code) || null;
};

export const isCurrencySupported = (code) => {
  return SUPPORTED_CURRENCIES.some(currency => currency.key === code);
};

