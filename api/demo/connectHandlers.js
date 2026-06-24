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
  return null;
}
