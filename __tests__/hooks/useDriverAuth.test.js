jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

const mockApiClient = {
  driver: null,
  driverLogin: jest.fn(),
  driverRegister: jest.fn(),
};

jest.mock('../../api', () => ({
  __esModule: true,
  default: mockApiClient,
}));

jest.mock('../../utils/driverUtils', () => ({
  updateDriverCache: jest.fn(() => Promise.resolve()),
  getDriverSessionFromCache: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('../../utils/cacheUtils', () => ({
  clearAllDriverSessionCaches: jest.fn(() => Promise.resolve()),
}));

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useDriverAuth } from '../../hooks/useDriverAuth';
import { updateDriverCache } from '../../utils/driverUtils';

describe('useDriverAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient.driver = null;
    mockApiClient.driverLogin.mockReset();
    mockApiClient.driverRegister.mockReset();
  });

  const waitForHookReady = async (result) => {
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  };

  describe('login', () => {
    it('authenticates and loads driver profile when login succeeds', async () => {
      const user = { _id: 'user-1', email: 'driver@test.com' };
      const driver = { _id: 'driver-1' };
      mockApiClient.driverLogin.mockResolvedValue({ token: 'token-1', user });
      mockApiClient.driver = driver;

      const { result } = renderHook(() => useDriverAuth());
      await waitForHookReady(result);

      let response;
      await act(async () => {
        response = await result.current.login('driver@test.com', 'secret123');
      });

      expect(mockApiClient.driverLogin).toHaveBeenCalledWith('driver@test.com', 'secret123');
      expect(response).toEqual({ token: 'token-1', user });
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.needsOnboarding).toBe(false);
      expect(result.current.driver).toEqual(driver);
      expect(updateDriverCache).toHaveBeenCalledWith(driver, 'token-1', user);
    });

    it('requires onboarding when login succeeds without a driver profile', async () => {
      const user = { _id: 'user-1', email: 'driver@test.com' };
      mockApiClient.driverLogin.mockResolvedValue({ token: 'token-1', user });
      mockApiClient.driver = null;

      const { result } = renderHook(() => useDriverAuth());
      await waitForHookReady(result);

      await act(async () => {
        await result.current.login('driver@test.com', 'secret123');
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.needsOnboarding).toBe(true);
      expect(result.current.driver).toBeNull();
      expect(updateDriverCache).toHaveBeenCalledWith(null, 'token-1', user);
    });

    it('rethrows when login fails', async () => {
      mockApiClient.driverLogin.mockRejectedValue(new Error('Incorrect email or password'));

      const { result } = renderHook(() => useDriverAuth());
      await waitForHookReady(result);

      await expect(
        act(async () => {
          await result.current.login('driver@test.com', 'wrong');
        })
      ).rejects.toThrow('Incorrect email or password');

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('register', () => {
    it('creates an account and marks onboarding as required', async () => {
      const signupData = {
        name: 'John Driver',
        email: 'john@test.com',
        phone: '0612345678',
        password: 'secret123',
      };
      const user = { _id: 'user-2', email: signupData.email };
      mockApiClient.driverRegister.mockResolvedValue({ token: 'token-2', user });

      const { result } = renderHook(() => useDriverAuth());
      await waitForHookReady(result);

      let response;
      await act(async () => {
        response = await result.current.register(signupData);
      });

      expect(mockApiClient.driverRegister).toHaveBeenCalledWith(signupData);
      expect(response).toEqual({ token: 'token-2', user });
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.needsOnboarding).toBe(true);
      expect(result.current.driver).toBeNull();
      expect(updateDriverCache).toHaveBeenCalledWith(null, 'token-2', user);
    });

    it('rethrows when registration fails', async () => {
      mockApiClient.driverRegister.mockRejectedValue(new Error('Email already exists'));

      const { result } = renderHook(() => useDriverAuth());
      await waitForHookReady(result);

      await expect(
        act(async () => {
          await result.current.register({
            name: 'John',
            email: 'john@test.com',
            password: 'secret123',
          });
        })
      ).rejects.toThrow('Email already exists');

      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
