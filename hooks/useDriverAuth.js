import { useState, useEffect } from 'react';
import apiClient from '../api';
import { clearAllDriverSessionCaches } from '../utils/cacheUtils';
import { updateDriverCache, getDriverSessionFromCache } from '../utils/driverUtils';

export const useDriverAuth = () => {
  const [driver, setDriver] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const applyDriverProfile = async (profileData, accountUser, authToken) => {
    if (profileData?._id || profileData?.id) {
      apiClient.driver = profileData;
      setDriver(profileData);
      setNeedsOnboarding(false);
      if (authToken) {
        await updateDriverCache(profileData, authToken, accountUser);
      }
      return profileData;
    }

    const existing = apiClient.driver;
    if (existing?._id || existing?.id) {
      setDriver(existing);
      setNeedsOnboarding(false);
      return existing;
    }

    apiClient.driver = null;
    setDriver(null);
    setNeedsOnboarding(true);
    return null;
  };

  const refreshDriverProfile = async (accountUser, token) => {
    if (!accountUser || !token) {
      setNeedsOnboarding(true);
      return null;
    }

    apiClient.token = token;
    apiClient.user = accountUser;

    const profileData = await apiClient.fetchDriverByUserId();
    return applyDriverProfile(profileData, accountUser, token);
  };

  useEffect(() => {
    const initializeDriver = async () => {
      try {
        const cached = await getDriverSessionFromCache();
        if (!cached?.token) return;

        apiClient.token = cached.token;
        apiClient.user = cached.user;
        apiClient.driver = cached.driver;

        const cachedDriverId = cached.driver?._id || cached.driver?.id;
        setNeedsOnboarding(!cached.user || !cachedDriverId);
        if (cachedDriverId) {
          setDriver(cached.driver);
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error initializing driver:', error);
        setNeedsOnboarding(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDriver();
  }, []);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await apiClient.driverLogin(email, password);

      if (response.user && response.token) {
        setNeedsOnboarding(!(apiClient.driver?._id || apiClient.driver?.id));
        setIsAuthenticated(true);
        await applyDriverProfile(apiClient.driver, response.user, response.token);
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (signupData) => {
    try {
      setIsLoading(true);
      const response = await apiClient.driverRegister(signupData);
      if (response.user && response.token) {
        setDriver(null);
        setNeedsOnboarding(true);
        setIsAuthenticated(true);
        await updateDriverCache(null, response.token, response.user);
      }

      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async (profileData) => {
    try {
      const profile = await apiClient.createDriverProfile(profileData);
      await updateDriverCache(profile, apiClient.token, apiClient.user);
      setDriver(profile);
      setNeedsOnboarding(false);
      return { success: true, driver: profile };
    } catch (error) {
      console.error('Onboarding error:', error);
      return { success: false, message: error.message || 'Failed to create driver profile' };
    }
  };

  const logout = async () => {
    try {
      const driverId = driver?._id || driver?.id;
      const userId =
        apiClient.user?._id ||
        apiClient.user?.id ||
        driver?.userId?._id ||
        driver?.userId ||
        driver?.users?.value;

      await clearAllDriverSessionCaches(driverId, userId);
      await apiClient.logout();
      setDriver(null);
      setIsAuthenticated(false);
      setNeedsOnboarding(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return {
    driver,
    isLoading,
    isAuthenticated,
    needsOnboarding,
    login,
    register,
    completeOnboarding,
    logout,
    setDriver,
    setIsAuthenticated,
  };
};
