import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Clés de stockage AsyncStorage
 */
export const STORAGE_KEYS = {
  DRIVER_DATA: 'driverData',
  DRIVER_TOKEN: 'driverToken',
  SETTINGS: 'settings'
};

/**
 * Met à jour le cache AsyncStorage avec les données du driver
 * @param {Object} driverData - Données du driver
 * @param {string} token - Token d'authentification
 */
export const updateDriverCache = async (driverData, token) => {
  try {
    if (driverData) {
      await AsyncStorage.setItem(STORAGE_KEYS.DRIVER_DATA, JSON.stringify(driverData));
    }
    if (token) {
      await AsyncStorage.setItem(STORAGE_KEYS.DRIVER_TOKEN, token);
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du cache driver:', error);
  }
};

/**
 * Vide le cache AsyncStorage du driver
 */
export const clearDriverCache = async () => {
  try {
    await AsyncStorage.multiRemove([STORAGE_KEYS.DRIVER_DATA, STORAGE_KEYS.DRIVER_TOKEN]);
  } catch (error) {
    console.error('Erreur lors du nettoyage du cache driver:', error);
  }
};

/**
 * Récupère les données du driver depuis le cache
 * @returns {Promise<Object|null>} Données du driver ou null
 */
export const getDriverFromCache = async () => {
  try {
    const driverData = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_DATA);
    return driverData ? JSON.parse(driverData) : null;
  } catch (error) {
    console.error('Erreur lors de la récupération du cache driver:', error);
    return null;
  }
};

/**
 * Récupère le token du driver depuis le cache
 * @returns {Promise<string|null>} Token ou null
 */
export const getDriverTokenFromCache = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_TOKEN);
  } catch (error) {
    console.error('Erreur lors de la récupération du token driver:', error);
    return null;
  }
};

/**
 * Vérifie si des données de driver sont présentes dans le cache
 * @returns {Promise<boolean>} True si des données existent
 */
export const hasDriverCache = async () => {
  try {
    const driverData = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_DATA);
    const token = await AsyncStorage.getItem(STORAGE_KEYS.DRIVER_TOKEN);
    return !!(driverData && token);
  } catch (error) {
    console.error('Erreur lors de la vérification du cache driver:', error);
    return false;
  }
};

/**
 * Sauvegarde des données génériques dans AsyncStorage
 * @param {string} key - Clé de stockage
 * @param {any} data - Données à sauvegarder
 */
export const saveToStorage = async (key, data) => {
  try {
    const serializedData = typeof data === 'string' ? data : JSON.stringify(data);
    await AsyncStorage.setItem(key, serializedData);
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde dans ${key}:`, error);
  }
};

/**
 * Récupère des données génériques depuis AsyncStorage
 * @param {string} key - Clé de stockage
 * @param {boolean} parseJson - Si true, parse le JSON automatiquement
 * @returns {Promise<any>} Données récupérées ou null
 */
export const getFromStorage = async (key, parseJson = true) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data && parseJson ? JSON.parse(data) : data;
  } catch (error) {
    console.error(`Erreur lors de la récupération depuis ${key}:`, error);
    return null;
  }
};

/**
 * Supprime une clé du stockage
 * @param {string} key - Clé à supprimer
 */
export const removeFromStorage = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Erreur lors de la suppression de ${key}:`, error);
  }
};

/**
 * Supprime plusieurs clés du stockage
 * @param {string[]} keys - Clés à supprimer
 */
export const multiRemoveFromStorage = async (keys) => {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error('Erreur lors de la suppression multiple:', error);
  }
};
