jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  handleDemoAuthWrite,
  getLocalDemoDriverProfile,
  handleDemoRead,
} from '../../api/demo/authHandlers';
import { DEMO_STORAGE_KEY } from '../../api/demo/localStore';

jest.mock('../../config', () => ({
  config: {
    DEMO_MODE: true,
    DEMO_EMAIL: 'driver@demo.com',
    DEMO_PASSWORD: 'driver123',
  },
}));

const client = {
  token: null,
  user: null,
  driver: null,
  saveDriverToStorage: jest.fn(() => Promise.resolve()),
};

describe('demo authHandlers', () => {
  beforeEach(async () => {
    client.token = null;
    client.user = null;
    client.driver = null;
    await AsyncStorage.removeItem(DEMO_STORAGE_KEY);
  });

  it('creates a local driver account on signup without calling the backend', async () => {
    const result = await handleDemoAuthWrite(client, '/auth/signup', 'POST', {
      body: JSON.stringify({
        email: 'new.driver@demo.com',
        password: 'secret123',
        name: 'New Driver',
        phone: '+33600000000',
        role: 'delivery',
      }),
    });

    expect(result.token).toMatch(/^demo_driver_token_/);
    expect(result.user.email).toBe('new.driver@demo.com');
    expect(client.user.name).toBe('New Driver');
    expect(client.driver).toBeNull();
    expect(client.saveDriverToStorage).toHaveBeenCalled();
  });

  it('rejects duplicate local signup emails', async () => {
    await handleDemoAuthWrite(client, '/auth/signup', 'POST', {
      body: JSON.stringify({
        email: 'dup@demo.com',
        password: 'secret123',
        name: 'First',
        role: 'delivery',
      }),
    });

    await expect(
      handleDemoAuthWrite(client, '/auth/signup', 'POST', {
        body: JSON.stringify({
          email: 'dup@demo.com',
          password: 'other',
          name: 'Second',
          role: 'delivery',
        }),
      })
    ).rejects.toThrow('Email already in use');
  });

  it('logs in a locally registered driver', async () => {
    await handleDemoAuthWrite(client, '/auth/signup', 'POST', {
      body: JSON.stringify({
        email: 'local@demo.com',
        password: 'secret123',
        name: 'Local Driver',
        role: 'delivery',
      }),
    });

    client.token = null;
    client.user = null;

    const login = await handleDemoAuthWrite(client, '/auth/delivery-login', 'POST', {
      body: JSON.stringify({ email: 'local@demo.com', password: 'secret123' }),
    });

    expect(login.token).toMatch(/^demo_driver_token_/);
    expect(login.user.email).toBe('local@demo.com');
  });

  it('creates a local driver profile after onboarding', async () => {
    await handleDemoAuthWrite(client, '/auth/signup', 'POST', {
      body: JSON.stringify({
        email: 'onboard@demo.com',
        password: 'secret123',
        name: 'Onboard Driver',
        role: 'delivery',
      }),
    });

    const profile = await handleDemoAuthWrite(client, '/resource/drivers', 'POST', {
      body: JSON.stringify({
        licenseNumber: 'LIC-123',
        vehicle: { type: 'bike', model: 'City', licensePlate: 'AB-123' },
      }),
    });

    expect(profile.licenseNumber).toBe('LIC-123');
    expect(profile.isDemo).toBe(true);

    const stored = await getLocalDemoDriverProfile(client.user.id);
    expect(stored?._id).toBe(profile._id);
  });

  describe('handleDemoRead', () => {
    beforeEach(async () => {
      await handleDemoAuthWrite(client, '/auth/signup', 'POST', {
        body: JSON.stringify({
          email: 'read@demo.com',
          password: 'secret123',
          name: 'Read Driver',
          role: 'delivery',
        }),
      });

      const profile = await handleDemoAuthWrite(client, '/resource/drivers', 'POST', {
        body: JSON.stringify({
          licenseNumber: 'LIC-READ',
          vehicle: { type: 'bike', model: 'City', licensePlate: 'AA-111' },
        }),
      });
      client.driver = profile;
    });

    it('serves local reads without backend for local demo tokens', async () => {
      expect(await handleDemoRead(client, '/resource/orders?driver=demo_driver_x', 'GET')).toEqual([]);
      expect(await handleDemoRead(client, '/resource/notifications', 'GET')).toEqual([]);
      expect(await handleDemoRead(client, '/resource/restaurants', 'GET')).toEqual([]);
      expect(await handleDemoRead(client, '/resource/customersupports?type=faq', 'GET')).toEqual([]);
      expect(await handleDemoRead(client, '/resource/app_settings', 'GET')).toEqual([]);
      expect(await handleDemoRead(client, '/resource/paymentMethods/byUserId', 'GET')).toEqual([]);
      expect(await handleDemoRead(client, '/resource/deliverysettings?type=abc', 'GET')).toEqual([]);
    });

    it('returns local driver profile and default settings', async () => {
      const profile = await handleDemoRead(client, '/resource/drivers/byUserId', 'GET');
      expect(profile.licenseNumber).toBe('LIC-READ');

      const settings = await handleDemoRead(client, '/resource/settings', 'GET');
      expect(settings[0].appName).toBe('Good Food Delivery');
      expect(settings[0].currency.code).toBe('EUR');
    });

    it('falls through to backend for non-local tokens', async () => {
      client.token = 'real.jwt.token';
      expect(await handleDemoRead(client, '/resource/orders', 'GET')).toBeNull();
    });
  });
});
