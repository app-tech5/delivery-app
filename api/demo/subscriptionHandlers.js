import { getDemoState, updateDemoState } from './localStore';
import { config } from '../../config';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const pathOnly = (endpoint) => String(endpoint || '').split('?')[0];

const newId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const DEMO_DRIVER_PLAN = {
  id: 'demo_plan_driver_elite',
  name: 'Driver Elite',
  target: 'driver',
  price: 9.99,
  currency: 'USD',
  billingCycle: 'monthly',
  benefits: ['Priority access to high-value jobs', 'Priority support'],
  benefitFlags: {
    freeDelivery: false,
    discountPercent: 0,
    reducedCommissionPercent: 0,
    prioritySupport: true,
  },
  isActive: true,
};

const benefitsFromEnrollment = (enrollment) => {
  if (!enrollment || enrollment.status !== 'active') {
    return {
      active: false,
      freeDelivery: false,
      discountPercent: 0,
      reducedCommissionPercent: 0,
      prioritySupport: false,
      planName: null,
      currentPeriodEnd: null,
    };
  }
  return {
    active: true,
    freeDelivery: false,
    discountPercent: 0,
    reducedCommissionPercent: 0,
    prioritySupport: true,
    planName: DEMO_DRIVER_PLAN.name,
    currentPeriodEnd: enrollment.currentPeriodEnd,
    benefits: DEMO_DRIVER_PLAN.benefits,
  };
};

export async function handleDemoSubscription(client, endpoint, method, options = {}) {
  if (!config.DEMO_MODE) return null;

  const endpointPath = pathOnly(endpoint);
  if (!endpointPath.startsWith('/subscriptions')) return null;

  const upper = (method || 'GET').toUpperCase();

  if (upper === 'GET' && endpointPath === '/subscriptions') {
    return { target: 'driver', plans: [DEMO_DRIVER_PLAN] };
  }

  if (upper === 'GET' && endpointPath === '/subscriptions/mine') {
    const state = await getDemoState();
    const enrollment = state.subscriptionEnrollment || null;
    return {
      target: 'driver',
      enrollment,
      benefits: benefitsFromEnrollment(enrollment),
    };
  }

  if (upper === 'GET' && endpointPath === '/subscriptions/mine/benefits') {
    const state = await getDemoState();
    return benefitsFromEnrollment(state.subscriptionEnrollment || null);
  }

  if (!WRITE_METHODS.has(upper)) return null;

  if (upper === 'POST' && /^\/subscriptions\/[^/]+\/subscribe$/.test(endpointPath)) {
    const planId = endpointPath.split('/')[2];
    if (planId !== DEMO_DRIVER_PLAN.id) {
      throw new Error('Subscription plan not found');
    }
    const end = new Date();
    end.setMonth(end.getMonth() + 1);
    const enrollment = {
      id: newId('demo_sub'),
      status: 'active',
      target: 'driver',
      startedAt: new Date().toISOString(),
      currentPeriodEnd: end.toISOString(),
      cancelledAt: null,
      autoRenew: true,
      paymentMethod: 'service_fee',
      plan: DEMO_DRIVER_PLAN,
    };
    await updateDemoState((state) => ({ ...state, subscriptionEnrollment: enrollment }));
    return { enrollment, benefits: benefitsFromEnrollment(enrollment) };
  }

  if (upper === 'POST' && endpointPath === '/subscriptions/mine/cancel') {
    await updateDemoState((state) => ({ ...state, subscriptionEnrollment: null }));
    return {
      enrollment: { status: 'cancelled' },
      benefits: benefitsFromEnrollment(null),
    };
  }

  return null;
}
