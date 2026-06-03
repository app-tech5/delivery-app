import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  DRIVER_DATA: 'driverData',
  DRIVER_TOKEN: 'driverToken',
  USER_DATA: 'userData',
  USER_TOKEN: 'userToken',
  SETTINGS: 'settings',
};

export const updateDriverCache = async (driverData, token, user) => {
  try {
    if (driverData) {
      await AsyncStorage.setItem(STORAGE_KEYS.DRIVER_DATA, JSON.stringify(driverData));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.DRIVER_DATA);
    }
    if (token) {
      await AsyncStorage.setItem(STORAGE_KEYS.DRIVER_TOKEN, token);
    }
    if (user) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    }
  } catch (error) {
    console.error('Error updating driver cache:', error);
  }
};

export const clearDriverCache = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.DRIVER_DATA,
      STORAGE_KEYS.DRIVER_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.USER_TOKEN,
    ]);
  } catch (error) {
    console.error('Error clearing driver cache:', error);
  }
};

export const getDriverSessionFromCache = async () => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_TOKEN);
    if (!token) return null;

    const driverData = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_DATA);
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);

    return {
      token,
      driver: driverData ? JSON.parse(driverData) : null,
      user: userData ? JSON.parse(userData) : null,
    };
  } catch (error) {
    console.error('Error reading driver session cache:', error);
    return null;
  }
};

export const getDriverFromCache = async () => {
  try {
    const driverData = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_DATA);
    return driverData ? JSON.parse(driverData) : null;
  } catch (error) {
    console.error('Error reading driver cache:', error);
    return null;
  }
};

export const getDriverTokenFromCache = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_TOKEN);
  } catch (error) {
    console.error('Error reading driver token:', error);
    return null;
  }
};

export const hasDriverCache = async () => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_TOKEN);
    return !!token;
  } catch (error) {
    console.error('Error checking driver cache:', error);
    return false;
  }
};

export const saveToStorage = async (key, data) => {
  try {
    const serializedData = typeof data === 'string' ? data : JSON.stringify(data);
    await AsyncStorage.setItem(key, serializedData);
  } catch (error) {
    console.error(`Error saving to ${key}:`, error);
  }
};

export const getFromStorage = async (key, parseJson = true) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data && parseJson ? JSON.parse(data) : data;
  } catch (error) {
    console.error(`Error reading from ${key}:`, error);
    return null;
  }
};

export const removeFromStorage = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
  }
};

export const multiRemoveFromStorage = async (keys) => {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error('Error removing storage keys:', error);
  }
};
