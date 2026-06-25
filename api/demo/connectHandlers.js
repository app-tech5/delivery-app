import { getDemoState, updateDemoState } from './localStore';

const DEMO_CONNECT_ACCOUNT_ID = 'acct_demo_driver_payout';

function buildDemoConnectState() {
  return {
    connected: true,
    accountId: DEMO_CONNECT_ACCOUNT_ID,
    detailsSubmitted: true,
    payoutsEnabled: true,
    chargesEnabled: true,
  };
}

function stripDuplicateStripeConnectFromPatch(patch) {
  return (patch.added || []).filter(
    (method) =>
      !(
        method.methodType === 'bank_transfer' &&
        method.purpose === 'payout' &&
        method.stripeConnectAccountId
      )
  );
}

export async function startDemoStripeConnectOnboarding() {
  const state = await getDemoState();
  const alreadyConnected = Boolean(state.stripeConnectDemo?.connected);

  await updateDemoState((current) => {
    const patch = current.paymentMethodsPatch || {};
    return {
      ...current,
      stripeConnectDemo: buildDemoConnectState(),
      paymentMethodsPatch: {
        ...patch,
        added: stripDuplicateStripeConnectFromPatch(patch),
      },
    };
  });

  return {
    accountId: DEMO_CONNECT_ACCOUNT_ID,
    url: null,
    demoCompleted: true,
    alreadyConnected,
  };
}

export async function getDemoStripeConnectStatus() {
  const state = await getDemoState();
  const connect = state.stripeConnectDemo;

  if (!connect?.connected) {
    return {
      connected: false,
      accountId: null,
      detailsSubmitted: false,
      payoutsEnabled: false,
      chargesEnabled: false,
      paymentMethod: null,
    };
  }

  return {
    connected: true,
    accountId: connect.accountId,
    detailsSubmitted: connect.detailsSubmitted,
    payoutsEnabled: connect.payoutsEnabled,
    chargesEnabled: connect.chargesEnabled,
    paymentMethod: null,
  };
}

export async function syncDemoStripeConnectPayoutMethod() {
  const state = await getDemoState();
  const connect = state.stripeConnectDemo;

  if (!connect?.connected) {
    return null;
  }

  const accountId = connect.accountId || DEMO_CONNECT_ACCOUNT_ID;
  const patch = state.paymentMethodsPatch || { added: [], updatedById: {}, deletedIds: [], defaultId: null };
  const existing = (patch.added || []).find(
    (method) =>
      method.methodType === 'bank_transfer' &&
      method.stripeConnectAccountId === accountId
  );

  if (existing) {
    return existing;
  }

  const method = {
    _id: `demo_pm_stripe_${Date.now()}`,
    id: `demo_pm_stripe_${Date.now()}`,
    methodType: 'bank_transfer',
    purpose: 'payout',
    stripeConnectAccountId: accountId,
    bankDetails: {
      ibanLast4: '7890',
      accountHolderName: 'Demo Driver',
      bankName: 'Stripe',
    },
    verificationStatus: 'verified',
    isDefault: !(patch.added || []).some((m) => m.isDefault),
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  await updateDemoState((current) => {
    const currentPatch = current.paymentMethodsPatch || { added: [], updatedById: {}, deletedIds: [], defaultId: null };
    return {
      ...current,
      paymentMethodsPatch: {
        ...currentPatch,
        added: [...stripDuplicateStripeConnectFromPatch(currentPatch), method],
        defaultId: currentPatch.defaultId || String(method._id),
      },
    };
  });

  return method;
}
