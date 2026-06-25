import { config } from '../../config';
import { getDemoState, updateDemoState } from './localStore';
import { SUPPORTED_CURRENCIES } from '../../utils/currencyUtils';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const pathOnly = (endpoint) => String(endpoint || '').split('?')[0];

const parseQuery = (endpoint) => {
  const queryString = String(endpoint || '').split('?')[1] || '';
  return new URLSearchParams(queryString);
};

const parseBody = (options) => {
  if (!options?.body) return {};
  if (typeof options.body === 'string') {
    try {
      return JSON.parse(options.body);
    } catch {
      return {};
    }
  }
  return options.body;
};

const newId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const demoUserFromRecord = (record) => ({
  _id: record.id,
  id: record.id,
  email: record.email,
  name: record.name,
  phone: record.phone || '',
  role: 'delivery',
});

const isBuiltinDemoEmail = (email) =>
  String(email || '')
    .trim()
    .toLowerCase() === String(config.DEMO_EMAIL || '').trim().toLowerCase();

const isLocalDemoToken = (token) =>
  String(token || '').startsWith('demo_driver_token_');

export async function getLocalDemoDriverProfile(userId) {
  if (!config.DEMO_MODE || !userId) {
    return null;
  }
  const state = await getDemoState();
  return state.driverProfiles[String(userId)] || null;
}

export async function handleDemoAuthWrite(client, endpoint, method, options = {}) {
  if (!config.DEMO_MODE || !WRITE_METHODS.has(method)) {
    return null;
  }

  const endpointPath = pathOnly(endpoint);
  const body = parseBody(options);

  if (endpointPath === '/auth/signup' && method === 'POST') {
    const email = String(body.email || '').trim().toLowerCase();
    if (!email || !body.password || !body.name) {
      throw new Error('Email, password and name are required');
    }

    const state = await getDemoState();
    const exists = state.registeredDrivers.some(
      (item) => String(item.email || '').trim().toLowerCase() === email
    );
    if (exists) {
      throw new Error('Email already in use');
    }

    const id = newId('demo_driver_user');
    const record = {
      id,
      email: String(body.email).trim(),
      password: body.password,
      name: String(body.name).trim(),
      phone: body.phone || '',
      role: body.role || 'delivery',
    };

    await updateDemoState((current) => ({
      ...current,
      registeredDrivers: [...current.registeredDrivers, record],
    }));

    const token = `demo_driver_token_${record.id}`;
    const user = demoUserFromRecord(record);
    client.token = token;
    client.user = user;
    client.driver = null;
    await client.saveDriverToStorage();

    return { token, user, message: 'Account created (demo)' };
  }

  if (endpointPath === '/auth/delivery-login' && method === 'POST') {
    if (isBuiltinDemoEmail(body.email)) {
      return null;
    }

    const state = await getDemoState();
    const email = String(body.email || '').trim().toLowerCase();
    const record = state.registeredDrivers.find(
      (item) => String(item.email || '').trim().toLowerCase() === email
    );

    if (!record) {
      return null;
    }

    if (record.password !== body.password) {
      throw new Error('Incorrect email or password');
    }

    const token = `demo_driver_token_${record.id}`;
    const user = demoUserFromRecord(record);
    client.token = token;
    client.user = user;
    client.driver = state.driverProfiles[record.id] || null;
    await client.saveDriverToStorage();
    return { token, user };
  }

  if (endpointPath === '/resource/drivers' && method === 'POST') {
    const userId = client.user?._id || client.user?.id;
    if (!userId || !isLocalDemoToken(client.token)) {
      return null;
    }

    const driverId = newId('demo_driver');
    const profile = {
      _id: driverId,
      id: driverId,
      users: body.users,
      userId,
      licenseNumber: body.licenseNumber || '',
      vehicle: body.vehicle || {},
      status: 'offline',
      isDemo: true,
      isApproved: true,
    };

    await updateDemoState((current) => ({
      ...current,
      driverProfiles: {
        ...current.driverProfiles,
        [String(userId)]: profile,
      },
    }));

    client.driver = profile;
    await client.saveDriverToStorage();
    return profile;
  }

  if (endpointPath.startsWith('/resource/drivers/') && method === 'PUT') {
    if (!isLocalDemoToken(client.token)) {
      return null;
    }

    const userId = client.user?._id || client.user?.id;
    const driver = client.driver || null;
    if (!userId || !driver) {
      throw new Error('Missing driver profile');
    }

    const updated = {
      ...driver,
      ...body,
    };

    await updateDemoState((current) => ({
      ...current,
      driverProfiles: {
        ...current.driverProfiles,
        [String(userId)]: updated,
      },
    }));

    client.driver = updated;
    await client.saveDriverToStorage();
    return updated;
  }

  if (endpointPath.startsWith('/resource/orders/') && method === 'PUT') {
    if (!isLocalDemoToken(client.token)) {
      return null;
    }

    const orderId = endpointPath.split('/').pop();
    await updateDemoState((current) => ({
      ...current,
      orderPatches: {
        ...current.orderPatches,
        [String(orderId)]: {
          ...(current.orderPatches[String(orderId)] || {}),
          ...body,
        },
      },
    }));
    return { _id: orderId, id: orderId, ...body };
  }

  return null;
}

const LOCAL_DEMO_SETTINGS = [
  {
    _id: 'demo_local_settings',
    appName: 'Good Food Delivery',
    language: { code: 'fr', name: 'Français' },
    currency: { code: 'EUR', symbol: '€' },
  },
];

const localDemoCurrencies = () =>
  SUPPORTED_CURRENCIES.map((item) => ({
    _id: item.key,
    code: item.key,
    symbol: item.symbol,
    name: item.label,
  }));

const getLocalDriverProfile = async (client) => {
  if (client.driver?._id || client.driver?.id) {
    return client.driver;
  }

  const userId = client.user?._id || client.user?.id;
  if (!userId) {
    return null;
  }

  const state = await getDemoState();
  return state.driverProfiles[String(userId)] || null;
};

const applyLocalOrderPatches = (orders, state) =>
  orders.map((order) => {
    const id = String(order?._id || order?.id || '');
    const patch = state.orderPatches[id];
    return patch ? { ...order, ...patch } : order;
  });

export async function handleDemoRead(client, endpoint, method) {
  if (!config.DEMO_MODE || method !== 'GET' || !isLocalDemoToken(client.token)) {
    return null;
  }

  const endpointPath = pathOnly(endpoint);
  const query = parseQuery(endpoint);
  const state = await getDemoState();

  if (endpointPath === '/resource/drivers/byUserId') {
    const profile = await getLocalDriverProfile(client);
    return profile || [];
  }

  if (endpointPath.startsWith('/resource/drivers/') && endpointPath !== '/resource/drivers/byUserId') {
    const driverId = endpointPath.split('/').pop();
    const profile = await getLocalDriverProfile(client);
    if (profile && String(profile._id || profile.id) === String(driverId)) {
      return profile;
    }
    return profile || null;
  }

  if (endpointPath === '/resource/orders') {
    return applyLocalOrderPatches([], state);
  }

  if (endpointPath.startsWith('/resource/orders/')) {
    const orderId = endpointPath.split('/').pop();
    const patch = state.orderPatches[String(orderId)];
    return patch ? { _id: orderId, id: orderId, ...patch } : null;
  }

  if (endpointPath === '/resource/notifications') {
    return [];
  }

  if (endpointPath === '/resource/customersupports' && query.get('type') === 'faq') {
    return [];
  }

  if (endpointPath === '/resource/app_settings') {
    return [];
  }

  if (endpointPath === '/resource/restaurants') {
    return [];
  }

  if (endpointPath === '/resource/settings') {
    return LOCAL_DEMO_SETTINGS;
  }

  if (endpointPath === '/resource/currencies') {
    return localDemoCurrencies();
  }

  if (endpointPath === '/resource/deliverysettings') {
    return [];
  }

  if (endpointPath === '/resource/paymentMethods/byUserId') {
    return [];
  }

  return null;
}

const mergeDriverWithLocalPatch = (data, userId, state) => {
  if (!userId) {
    return data;
  }
  const patch = state.driverProfiles[String(userId)];
  if (!patch) {
    return data;
  }
  if (Array.isArray(data)) {
    if (!data.length) {
      return [patch];
    }
    return data.map((item, index) => (index === 0 ? { ...item, ...patch } : item));
  }
  return data ? { ...data, ...patch } : patch;
};

export async function mergeDemoAuthRead(endpoint, data, client) {
  if (!config.DEMO_MODE) {
    return data;
  }

  const endpointPath = pathOnly(endpoint);
  const state = await getDemoState();
  const userId = client?.user?._id || client?.user?.id;

  if (endpointPath === '/resource/drivers/byUserId') {
    return mergeDriverWithLocalPatch(data, userId, state);
  }

  if (endpointPath.startsWith('/resource/drivers/') && endpointPath !== '/resource/drivers/byUserId') {
    return mergeDriverWithLocalPatch(data, userId, state);
  }

  if (endpointPath === '/resource/orders') {
    const orders = Array.isArray(data) ? data : [];
    return orders.map((order) => {
      const id = String(order?._id || order?.id || '');
      const patch = state.orderPatches[id];
      return patch ? { ...order, ...patch } : order;
    });
  }

  if (endpointPath.startsWith('/resource/orders/')) {
    const orderId = endpointPath.split('/').pop();
    const patch = state.orderPatches[String(orderId)];
    if (!patch) return data;
    return data ? { ...data, ...patch } : data;
  }

  return data;
}
