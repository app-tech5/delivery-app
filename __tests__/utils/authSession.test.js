jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  STORAGE_KEYS,
  updateDriverCache,
  getDriverSessionFromCache,
} from '../../utils/storageUtils';

describe('auth session storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateDriverCache', () => {
    it('persists driver, token and user after login', async () => {
      const driver = { _id: 'driver-1' };
      const user = { _id: 'user-1', email: 'driver@test.com' };

      await updateDriverCache(driver, 'token-1', user);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.DRIVER_DATA,
        JSON.stringify(driver)
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.DRIVER_TOKEN,
        'token-1'
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(user)
      );
    });

    it('clears driver data after sign-up before onboarding', async () => {
      const user = { _id: 'user-2', email: 'john@test.com' };

      await updateDriverCache(null, 'token-2', user);

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.DRIVER_DATA);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.DRIVER_TOKEN,
        'token-2'
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(user)
      );
    });
  });

  describe('getDriverSessionFromCache', () => {
    it('returns null when no token is stored', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null);

      const session = await getDriverSessionFromCache();

      expect(session).toBeNull();
    });

    it('returns cached session used to restore sign-in state', async () => {
      const driver = { _id: 'driver-1' };
      const user = { _id: 'user-1', email: 'driver@test.com' };

      AsyncStorage.getItem
        .mockResolvedValueOnce('token-1')
        .mockResolvedValueOnce(JSON.stringify(driver))
        .mockResolvedValueOnce(JSON.stringify(user));

      const session = await getDriverSessionFromCache();

      expect(session).toEqual({
        token: 'token-1',
        driver,
        user,
      });
    });
  });
});
