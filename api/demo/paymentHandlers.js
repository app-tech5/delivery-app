import { getDemoState, updateDemoState } from './localStore';
import { normalizePaymentMethod, consolidatePayoutMethods } from '../../utils/paymentMethodUtils';

const emptyPatch = () => ({
  added: [],
  updatedById: {},
  deletedIds: [],
  defaultId: null,
});

function getPatch(state) {
  return { ...emptyPatch(), ...(state.paymentMethodsPatch || {}) };
}

function applyPaymentOverrides(methods = [], patch) {
  const deleted = new Set((patch.deletedIds || []).map(String));
  const updatedById = patch.updatedById || {};
  const defaultId = patch.defaultId ? String(patch.defaultId) : null;

  let list = (methods || [])
    .filter((method) => !deleted.has(String(method._id)))
    .map((method) => {
      const id = String(method._id);
      const update = updatedById[id];
      if (!update) return normalizePaymentMethod(method);
      return normalizePaymentMethod({
        ...method,
        ...update,
        cardDetails: update.cardDetails
          ? { ...(method.cardDetails || {}), ...update.cardDetails }
          : method.cardDetails,
      });
    });

  list = [...list, ...(patch.added || []).map(normalizePaymentMethod)];

  list = consolidatePayoutMethods(list);

  if (defaultId) {
    list = list.map((method) => ({
      ...method,
      isDefault: String(method._id || method.id) === defaultId,
    }));
  }

  return list;
}

/** Fusionne les méthodes API avec les patches locaux (mode démo). */
export async function mergeDemoPaymentMethods(apiMethods) {
  const state = await getDemoState();
  const merged = applyPaymentOverrides(apiMethods, getPatch(state));
  return merged.filter((method) => (method.purpose || 'payment') === 'payout');
}

function findInAdded(patch, paymentMethodId) {
  const id = String(paymentMethodId);
  return (patch.added || []).find((method) => String(method._id) === id) || null;
}

export async function createDemoPaymentMethod(paymentData) {
  const method = normalizePaymentMethod({
    _id: `demo_pm_${Date.now()}`,
    verificationStatus: 'verified',
    isDefault: false,
    isActive: true,
    purpose: 'payout',
    createdAt: new Date().toISOString(),
    ...paymentData,
  });

  await updateDemoState((state) => {
    const patch = getPatch(state);
    return {
      ...state,
      paymentMethodsPatch: {
        ...patch,
        added: [...patch.added, method],
      },
    };
  });

  return method;
}

export async function updateDemoPaymentMethod(paymentMethodId, paymentData) {
  const id = String(paymentMethodId);
  let updated = null;

  await updateDemoState((state) => {
    const patch = getPatch(state);
    const inAdded = findInAdded(patch, id);

    if (inAdded) {
      const nextAdded = patch.added.map((method) => {
        if (String(method._id) !== id) return method;
        updated = normalizePaymentMethod({
          ...method,
          ...paymentData,
          cardDetails: paymentData.cardDetails
            ? { ...(method.cardDetails || {}), ...paymentData.cardDetails }
            : method.cardDetails,
        });
        return updated;
      });
      return {
        ...state,
        paymentMethodsPatch: { ...patch, added: nextAdded },
      };
    }

    const previous = patch.updatedById[id] || {};
    updated = normalizePaymentMethod({
      ...previous,
      ...paymentData,
      cardDetails: paymentData.cardDetails
        ? { ...(previous.cardDetails || {}), ...paymentData.cardDetails }
        : previous.cardDetails,
    });

    return {
      ...state,
      paymentMethodsPatch: {
        ...patch,
        updatedById: { ...patch.updatedById, [id]: updated },
      },
    };
  });

  if (!updated) {
    throw new Error('Payment method not found');
  }

  return updated;
}

export async function deleteDemoPaymentMethod(paymentMethodId) {
  const id = String(paymentMethodId);

  await updateDemoState((state) => {
    const patch = getPatch(state);
    const inAdded = findInAdded(patch, id);

    if (inAdded) {
      return {
        ...state,
        paymentMethodsPatch: {
          ...patch,
          added: patch.added.filter((method) => String(method._id) !== id),
          defaultId: patch.defaultId === id ? null : patch.defaultId,
        },
      };
    }

    return {
      ...state,
      paymentMethodsPatch: {
        ...patch,
        deletedIds: [...new Set([...patch.deletedIds, id])],
        defaultId: patch.defaultId === id ? null : patch.defaultId,
      },
    };
  });

  return { success: true };
}

export async function setDemoDefaultPaymentMethod(paymentMethodId) {
  const id = String(paymentMethodId);

  await updateDemoState((state) => ({
    ...state,
    paymentMethodsPatch: {
      ...getPatch(state),
      defaultId: id,
    },
  }));

  return { success: true };
}
