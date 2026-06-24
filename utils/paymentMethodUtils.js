function maskPaypalEmailLocal(email) {
  if (!email || typeof email !== 'string') return '';
  return email.replace(/(.{1,3})(.*)(@.*)/, (_match, start, middle, domain) =>
    `${start}${middle.replace(/./g, '*')}${domain}`
  );
}

export function getPaypalDisplayEmail(method) {
  const normalized = normalizePaymentMethod(method);
  return normalized.paypalEmailMasked || normalized.paypalEmail || '';
}

export function normalizePaymentMethod(method) {
  if (!method) return method;

  const cardDetails = method.cardDetails || {};
  const bankDetails = method.bankDetails || {};
  const last4 =
    cardDetails.cardNumberLast4 ||
    method.last4 ||
    method.cardNumberLast4 ||
    '****';
  const expiryMonth = cardDetails.expiryMonth ?? method.expiryMonth;
  const expiryYear = cardDetails.expiryYear ?? method.expiryYear;
  const cardBrand = cardDetails.cardBrand || method.cardBrand || 'card';
  const cardholderName = cardDetails.cardholderName || method.cardholderName || '';
  const ibanLast4 = bankDetails.ibanLast4 || '****';

  if (method.methodType === 'bank_transfer') {
    return {
      ...method,
      purpose: method.purpose || 'payout',
      bankDetails: {
        ...bankDetails,
        ibanLast4,
        accountHolderName: bankDetails.accountHolderName || '',
        bankName: bankDetails.bankName || '',
      },
    };
  }

  if (method.methodType === 'paypal') {
    return {
      ...method,
      purpose: method.purpose || 'payout',
      paypalEmailMasked:
        method.paypalEmailMasked ||
        (method.paypalEmail ? maskPaypalEmailLocal(method.paypalEmail) : ''),
    };
  }

  if (method.methodType !== 'credit_card' && method.methodType !== 'debit_card') {
    return { ...method, purpose: method.purpose || 'payment' };
  }

  return {
    ...method,
    purpose: method.purpose || 'payment',
    cardBrand,
    cardDetails: {
      ...cardDetails,
      cardNumberLast4: last4,
      expiryMonth,
      expiryYear,
      cardBrand,
      cardholderName,
    },
  };
}

export function normalizePaymentMethods(methods) {
  const normalized = (methods || []).map(normalizePaymentMethod);
  return consolidatePayoutMethods(normalized);
}

function payoutMethodKey(method) {
  if (method.stripeConnectAccountId) {
    return `stripe:${method.stripeConnectAccountId}`;
  }
  if (method.methodType === 'paypal') {
    return `paypal:${method.paypalEmailMasked || method.paypalEmail || ''}`;
  }
  return `id:${method._id || method.id}`;
}

function preferPayoutMethod(current, candidate) {
  if (!current) return candidate;
  if (!candidate) return current;

  const currentIsPatch = String(current._id || '').startsWith('demo_pm_');
  const candidateIsPatch = String(candidate._id || '').startsWith('demo_pm_');

  if (currentIsPatch !== candidateIsPatch) {
    return currentIsPatch ? candidate : current;
  }

  return candidate;
}

export function consolidatePayoutMethods(methods) {
  const payoutBuckets = new Map();
  const others = [];

  for (const method of methods || []) {
    if ((method.purpose || 'payment') !== 'payout') {
      others.push(method);
      continue;
    }

    const key = payoutMethodKey(method);
    payoutBuckets.set(key, preferPayoutMethod(payoutBuckets.get(key), method));
  }

  const payoutMethods = [...payoutBuckets.values()];
  if (payoutMethods.length === 0) {
    return others;
  }

  const defaultCandidate =
    payoutMethods.find((method) => method.isDefault && method.stripeConnectAccountId) ||
    payoutMethods.find((method) => method.isDefault) ||
    payoutMethods.find((method) => method.stripeConnectAccountId) ||
    payoutMethods[0];

  const defaultId = String(defaultCandidate._id || defaultCandidate.id);

  return [
    ...others,
    ...payoutMethods.map((method) => ({
      ...method,
      isDefault: String(method._id || method.id) === defaultId,
    })),
  ];
}

export function formatMaskedCard(method) {
  const normalized = normalizePaymentMethod(method);
  const last4 = normalized.cardDetails?.cardNumberLast4 || '****';
  return `•••• •••• •••• ${last4}`;
}

export function formatMaskedBank(method) {
  const normalized = normalizePaymentMethod(method);
  const last4 = normalized.bankDetails?.ibanLast4 || '****';
  const holder = normalized.bankDetails?.accountHolderName;
  const bankName = normalized.bankDetails?.bankName;
  const masked = `IBAN •••• ${last4}`;
  if (holder && bankName) return `${holder} — ${bankName} ${masked}`;
  if (holder) return `${holder} — ${masked}`;
  return masked;
}

export function formatCardBrandLabel(method) {
  const normalized = normalizePaymentMethod(method);
  const brand = (normalized.cardBrand || normalized.cardDetails?.cardBrand || 'CARD').toUpperCase();
  const last4 = normalized.cardDetails?.cardNumberLast4 || '****';
  return `${brand} ****${last4}`;
}

export function formatPayoutMethodLabel(method) {
  const normalized = normalizePaymentMethod(method);
  if (!normalized) return '';

  switch (normalized.methodType) {
    case 'bank_transfer':
      return formatMaskedBank(normalized);
    case 'paypal':
      return `PayPal ${getPaypalDisplayEmail(normalized).split('@')[0] || ''}`;
    default:
      return normalized.methodType || '';
  }
}

export function isStripeConnectMethod(method) {
  return Boolean(normalizePaymentMethod(method)?.stripeConnectAccountId);
}
