jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../config', () => {
  const actual = jest.requireActual('../../config');
  return {
    ...actual,
    config: { ...actual.config, DEMO_MODE: false },
  };
});

jest.mock('../../utils/storageUtils', () => ({
  clearDriverCache: jest.fn(() => Promise.resolve()),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../api';
import { config } from '../../config';

const apiUrl = (path) => `${config.API_BASE_URL}${path}`;

const jsonResponse = (data, ok = true, status = 200) => ({
  ok,
  status,
  json: jest.fn(() => Promise.resolve(data)),
});

describe('auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    apiClient.token = null;
    apiClient.user = null;
    apiClient.driver = null;
  });

  describe('driverLogin', () => {
    it('posts credentials and stores session with driver profile', async () => {
      const user = { _id: 'user-1', email: 'driver@test.com' };
      const driver = { _id: 'driver-1', userId: 'user-1' };

      global.fetch
        .mockResolvedValueOnce(jsonResponse({ token: 'token-1', user }))
        .mockResolvedValueOnce(jsonResponse(driver));

      const response = await apiClient.driverLogin('driver@test.com', 'secret123');

      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        apiUrl('/auth/delivery-login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'driver@test.com', password: 'secret123' }),
        })
      );
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        apiUrl('/resource/drivers/byUserId'),
        expect.any(Object)
      );
      expect(response).toEqual({ token: 'token-1', user });
      expect(apiClient.token).toBe('token-1');
      expect(apiClient.user).toEqual(user);
      expect(apiClient.driver).toEqual(driver);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('driverToken', 'token-1');
    });

    it('stores session without driver profile when profile is missing', async () => {
      const user = { _id: 'user-1', email: 'driver@test.com' };

      global.fetch
        .mockResolvedValueOnce(jsonResponse({ token: 'token-1', user }))
        .mockResolvedValueOnce(jsonResponse({ message: 'not found' }, false, 404));

      const response = await apiClient.driverLogin('driver@test.com', 'secret123');

      expect(response).toEqual({ token: 'token-1', user });
      expect(apiClient.driver).toBeNull();
    });

    it('throws when authentication response is invalid', async () => {
      global.fetch.mockResolvedValueOnce(jsonResponse({ user: { _id: 'user-1' } }));

      await expect(
        apiClient.driverLogin('driver@test.com', 'secret123')
      ).rejects.toThrow('Authentication failed');
    });
  });

  describe('driverRegister', () => {
    it('creates a delivery account and stores session without driver profile', async () => {
      const user = { _id: 'user-2', email: 'john@test.com', role: 'delivery' };

      global.fetch.mockResolvedValueOnce(jsonResponse({ token: 'token-2', user }));

      const signupData = {
        name: 'John Driver',
        email: 'john@test.com',
        phone: '0612345678',
        password: 'secret123',
      };

      const response = await apiClient.driverRegister(signupData);

      expect(global.fetch).toHaveBeenCalledWith(
        apiUrl('/auth/signup'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: signupData.email,
            password: signupData.password,
            name: signupData.name,
            phone: signupData.phone,
            role: 'delivery',
          }),
        })
      );
      expect(response).toEqual({ token: 'token-2', user });
      expect(apiClient.token).toBe('token-2');
      expect(apiClient.user).toEqual(user);
      expect(apiClient.driver).toBeNull();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('driverToken', 'token-2');
    });

    it('throws when registration response is invalid', async () => {
      global.fetch.mockResolvedValueOnce(jsonResponse({ user: { _id: 'user-2' } }));

      await expect(
        apiClient.driverRegister({
          name: 'John',
          email: 'john@test.com',
          password: 'secret123',
        })
      ).rejects.toThrow('Registration failed');
    });
  });
});
