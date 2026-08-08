import { getDemoState, updateDemoState } from './localStore';
import { config } from '../../config';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const pathOnly = (endpoint) => String(endpoint || '').split('?')[0];

const newId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const DEMO_DRIVER_PLANS = [
  {
    id: 'demo_plan_driver_starter',
    name: 'Driver Starter',
    target: 'driver',
    price: 9.99,
    currency: 'USD',
    billingCycle: 'monthly',
    benefits: ['Access to standard job offers', 'In-app navigation', 'Basic support'],
    benefitFlags: {
      freeDelivery: false,
      discountPercent: 0,
      reducedCommissionPercent: 0,
      prioritySupport: false,
    },
    isActive: true,
  },
  {
    id: 'demo_plan_driver_priority',
    name: 'Driver Priority',
    target: 'driver',
    price: 19.99,
    currency: 'USD',
    billingCycle: 'monthly',
    benefits: ['Priority job offers', 'Lower platform cut', 'Priority support'],
    benefitFlags: {
      freeDelivery: false,
      discountPercent: 0,
      reducedCommissionPercent: 3,
      prioritySupport: true,
    },
    isActive: true,
  },
  {
    id: 'demo_plan_driver_elite',
    name: 'Driver Elite',
    target: 'driver',
    price: 34.99,
    currency: 'USD',
    billingCycle: 'monthly',
    benefits: [
      'First access to high-value jobs',
      'Lowest platform cut',
      'Dedicated priority support',
      'Weekly earnings bonus eligibility',
    ],
    benefitFlags: {
      freeDelivery: false,
      discountPercent: 0,
      reducedCommissionPercent: 6,
      prioritySupport: true,
    },
    isActive: true,
  },
];

const DEMO_DRIVER_PLAN = DEMO_DRIVER_PLANS[2];

const DEMO_PLANS_BY_ID = Object.fromEntries(DEMO_DRIVER_PLANS.map((p) => [p.id, p]));

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
  const plan = enrollment.plan || DEMO_DRIVER_PLAN;
  return {
    active: true,
    freeDelivery: false,
    discountPercent: 0,
    reducedCommissionPercent: Number(plan.benefitFlags?.reducedCommissionPercent) || 0,
    prioritySupport: !!plan.benefitFlags?.prioritySupport,
    planName: plan.name,
    currentPeriodEnd: enrollment.currentPeriodEnd,
    benefits: plan.benefits,
  };
};

export async function handleDemoSubscription(client, endpoint, method, options = {}) {
  if (!config.DEMO_MODE) return null;

  const endpointPath = pathOnly(endpoint);
  if (!endpointPath.startsWith('/subscriptions')) return null;

  const upper = (method || 'GET').toUpperCase();

  if (upper === 'GET' && endpointPath === '/subscriptions') {
    return { target: 'driver', plans: DEMO_DRIVER_PLANS };
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
    const plan = DEMO_PLANS_BY_ID[planId];
    if (!plan) {
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
      plan,
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
