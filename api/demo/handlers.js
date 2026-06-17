import { config } from '../../config';
import { getDemoState, updateDemoState } from './localStore';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const pathOnly = (endpoint) => String(endpoint || '').split('?')[0];

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

export async function handleDemoWrite(client, endpoint, method, options = {}) {
  if (!config.DEMO_MODE || !WRITE_METHODS.has(method)) {
    return null;
  }

  const endpointPath = pathOnly(endpoint);
  const body = parseBody(options);

  if (endpointPath === '/auth/delivery-login' && method === 'POST') {
    const state = await getDemoState();
    const email = String(body.email || '').trim().toLowerCase();
    const record = state.registeredDrivers.find(
      (item) => String(item.email || '').trim().toLowerCase() === email
    );

    if (!record) {
      if (
        email === String(config.DEMO_EMAIL || '').trim().toLowerCase() &&
        body.password === config.DEMO_PASSWORD
      ) {
        const id = 'demo_driver_user';
        const token = `demo_driver_token_${id}`;
        const user = {
          _id: id,
          id,
          email: config.DEMO_EMAIL,
          name: 'Demo Driver',
          role: 'delivery',
        };
        client.token = token;
        client.user = user;
        client.driver = null;
        await client.saveDriverToStorage();
        return { token, user };
      }
      throw new Error('Incorrect email or password');
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
      role: 'delivery',
    };

    await updateDemoState((current) => ({
      ...current,
      registeredDrivers: [...current.registeredDrivers, record],
    }));

    const token = `demo_driver_token_${id}`;
    const user = demoUserFromRecord(record);
    client.token = token;
    client.user = user;
    client.driver = null;
    await client.saveDriverToStorage();
    return { token, user };
  }

  if (endpointPath === '/resource/drivers' && method === 'POST') {
    const userId = client.user?._id || client.user?.id;
    if (!userId) {
      throw new Error('Missing authenticated user');
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

export async function handleDemoRead(client, endpoint, method) {
  if (!config.DEMO_MODE || method !== 'GET') {
    return null;
  }

  const endpointPath = pathOnly(endpoint);

  if (endpointPath === '/resource/drivers/byUserId') {
    const userId = client.user?._id || client.user?.id;
    if (!userId) return null;
    const state = await getDemoState();
    return state.driverProfiles[String(userId)] || null;
  }

  return null;
}

export async function mergeDemoRead(endpoint, data) {
  if (!config.DEMO_MODE) return data;

  const endpointPath = pathOnly(endpoint);
  const state = await getDemoState();

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

