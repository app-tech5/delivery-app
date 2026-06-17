// API Client pour l'application delivery
import { config } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearDriverCache } from './utils/storageUtils';
import { handleDemoWrite, mergeDemoRead, getLocalDemoDriverProfile } from './api/demo/handlers';

const API_BASE_URL = config.API_BASE_URL;
const API_TIMEOUT = config.API_TIMEOUT;

class ApiClient {
  constructor() {
    this.token = null;
    this.user = null;
    this.driver = null;
    this.initializeFromStorage();
  }

  async initializeFromStorage() {
    try {
      const token = await AsyncStorage.getItem('driverToken');
      const driverData = await AsyncStorage.getItem('driverData');
      const userData = await AsyncStorage.getItem('userData');

      if (token) {
        this.token = token;
      }
      if (userData) {
        this.user = JSON.parse(userData);
      }
      if (driverData) {
        this.driver = JSON.parse(driverData);
      }
    } catch (error) {
      console.error('Error initializing driver from storage:', error);
    }
  }

  // Configuration des headers avec token si disponible
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Méthode générique pour les appels API
  async apiCall(endpoint, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    try {
      if (config.DEMO_MODE) {
        const localWrite = await handleDemoWrite(this, endpoint, method, options);
        if (localWrite !== null) {
          return localWrite;
        }
      }

      const url = `${API_BASE_URL}${endpoint}`;
      const requestConfig = {
        headers: this.getHeaders(),
        ...options,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      requestConfig.signal = controller.signal;

      const response = await fetch(url, requestConfig);
      clearTimeout(timeoutId);

      if (!response.ok) {
        let message = `HTTP error! status: ${response.status}`;
        try {
          const data = await response.json();
          if (data.message) message = data.message;
        } catch (_) { }
        const error = new Error(message);
        error.status = response.status;
        throw error;
      }

      const data = await response.json();
      if (config.DEMO_MODE && method === 'GET') {
        return mergeDemoRead(endpoint, data, this);
      }
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - check your connection');
      }
      console.error(`API call failed: ${endpoint}`, error);
      throw error;
    }
  }

  async apiCallMultipart(endpoint, options = {}) {
    const method = (options.method || 'POST').toUpperCase();
    try {
      if (config.DEMO_MODE) {
        const localWrite = await handleDemoWrite(this, endpoint, method, options);
        if (localWrite !== null) {
          return localWrite;
        }
      }

      const url = `${API_BASE_URL}${endpoint}`;
      const headers = {};
      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const response = await fetch(url, {
        ...options,
        headers: { ...headers, ...options.headers },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - check your connection');
      }
      console.error(`API call failed: ${endpoint}`, error);
      throw error;
    }
  }

  async driverLogin(email, password) {
    try {
      const response = await this.apiCall('/auth/delivery-login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.token && response.user) {
        this.token = response.token;
        this.user = response.user;

        // Try loading driver profile (may not exist yet)
        try {
          this.driver = await this.fetchDriverByUserId();
        } catch (driverError) {
          console.log('No driver profile yet:', driverError);
          this.driver = null;
        }

        await this.saveDriverToStorage();
        return response;
      }

      throw new Error('Authentication failed');
    } catch (error) {
      console.error('Driver login error:', error);
      throw error;
    }
  }

  async driverRegister(driverData) {
    try {
      // Create user account only. Driver profile is created in onboarding.
      const userResponse = await this.apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: driverData.email,
          password: driverData.password,
          name: driverData.name,
          phone: driverData.phone,
          role: 'delivery',
        }),
      });

      if (userResponse.token && userResponse.user) {
        this.token = userResponse.token;
        this.user = userResponse.user;
        this.driver = null;
        await this.saveDriverToStorage();
        return userResponse;
      }

      throw new Error('Registration failed');
    } catch (error) {
      console.error('Driver register error:', error);
      throw error;
    }
  }

  async createDriverProfile(profileData) {
    if (!this.user?.id && !this.user?._id) {
      throw new Error('Missing authenticated user');
    }

    const userId = this.user.id || this.user._id;
    const driverProfile = await this.apiCall('/resource/drivers', {
      method: 'POST',
      body: JSON.stringify({
        users: {
          value: userId,
          label: this.user.name || this.user.email || '',
        },
        licenseNumber: profileData.licenseNumber,
        vehicle: {
          type: profileData.vehicleType || '',
          model: profileData.vehicleModel || '',
          licensePlate: profileData.licensePlate || '',
        },
      }),
    });

    this.driver = driverProfile;
    await this.saveDriverToStorage();
    return driverProfile;
  }

  // Gestion du statut du driver
  async updateDriverStatus(status, location = null) {
    const driverId = this.driver?._id || this.driver?.id;
    if (!driverId) {
      throw new Error('Missing driver profile');
    }

    const updateData = { status };
    if (location) {
      updateData.location = {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
      };
    }

    const updatedDriver = await this.apiCall(`/resource/drivers/${driverId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });

    this.driver = updatedDriver;
    await this.saveDriverToStorage();
    return { driver: updatedDriver };
  }

  async updateDriverLocation(location, source = 'app') {
    const driverId = this.driver?._id || this.driver?.id;
    if (!driverId || !location) {
      throw new Error('Missing driver or location');
    }

    console.log(
      `📍 [${source}] Envoi backend → lat: ${location.latitude}, lon: ${location.longitude}`
    );

    const updatedDriver = await this.apiCall(`/resource/drivers/${driverId}`, {
      method: 'PUT',
      body: JSON.stringify({
        location: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude],
        },
      }),
    });

    this.driver = updatedDriver;
    await this.saveDriverToStorage();
    return updatedDriver;
  }

  // Récupération des commandes disponibles pour livraison
  async getAvailableOrders() {
    return await this.apiCall('/resource/orders?status=preparing');
  }

  // Récupérer les commandes du driver
  async getDriverOrders(status = null) {
    let query = `driver=${this.driver._id}`;
    if (status) {
      query += `&status=${status}`;
    }
    return await this.apiCall(`/resource/orders?${query}`);
  }

  // Mettre à jour une commande (statut, driver, etc.)
  async updateOrder(orderId, data) {
    return await this.apiCall(`/resource/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Récupérer les statistiques du driver
  async getDriverStats() {
    try {
      const orders = await this.getDriverOrders();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });

      return {
        todayDeliveries: todayOrders.filter(order => order.status === 'delivered').length,
        totalEarnings: todayOrders
          .filter(order => order.status === 'delivered')
          .reduce((total, order) => total + (order.delivery?.deliveryFee || 0), 0),
        rating: this.driver?.rating || 0,
        completedOrders: orders.filter(order => order.status === 'delivered').length
      };
    } catch (error) {
      console.error('Error calculating driver stats:', error);
      return {
        todayDeliveries: 0,
        totalEarnings: 0,
        rating: 0,
        completedOrders: 0
      };
    }
  }

  // Récupérer les méthodes de paiement de l'utilisateur
  async getPaymentMethods() {
    try {
      const paymentMethods = await this.apiCall('/resource/paymentmethods');
      return paymentMethods || [];

    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  }

  // Créer une nouvelle méthode de paiement
  async createPaymentMethod(paymentMethodData) {
    try {
      const result = await this.apiCall('/resource/paymentmethods', {
        method: 'POST',
        body: JSON.stringify(paymentMethodData),
      });
      return result;
    } catch (error) {
      console.error('Error creating payment method:', error);
      throw error;
    }
  }

  // Mettre à jour une méthode de paiement
  async updatePaymentMethod(paymentMethodId, paymentMethodData) {
    try {
      const result = await this.apiCall(`/resource/paymentmethods/${paymentMethodId}`, {
        method: 'PUT',
        body: JSON.stringify(paymentMethodData),
      });
      return result;
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  }

  // Supprimer une méthode de paiement
  async deletePaymentMethod(paymentMethodId) {
    try {
      const result = await this.apiCall(`/resource/paymentmethods/${paymentMethodId}`, {
        method: 'DELETE',
      });
      return result;
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  }

  // Définir une méthode de paiement par défaut
  async setDefaultPaymentMethod(paymentMethodId) {
    try {
      const result = await this.apiCall(`/resource/paymentmethods/${paymentMethodId}/set-default`, {
        method: 'PUT',
      });
      return result;
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  }

  // Sauvegarder dans AsyncStorage (pour utilisateurs normaux)
  async saveToStorage() {
    try {
      if (this.token) {
        await AsyncStorage.setItem('userToken', this.token);
      }
      if (this.user) {
        await AsyncStorage.setItem('userData', JSON.stringify(this.user));
      }
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  // Sauvegarder les données driver dans AsyncStorage
  async saveDriverToStorage() {
    try {
      if (this.token) {
        await AsyncStorage.setItem('driverToken', this.token);
      }
      if (this.user) {
        await AsyncStorage.setItem('userData', JSON.stringify(this.user));
      }
      if (this.driver) {
        await AsyncStorage.setItem('driverData', JSON.stringify(this.driver));
      }
    } catch (error) {
      console.error('Error saving driver to storage:', error);
    }
  }

  async logout() {
    this.token = null;
    this.user = null;
    this.driver = null;
    await clearDriverCache();
  }

  async fetchDriverByUserId() {
    try {
      const result = await this.apiCall('/resource/drivers/byUserId');
      const profile = Array.isArray(result) ? result[0] : result;
      if (profile?._id || profile?.id) {
        this.driver = profile;
        return profile;
      }
    } catch (error) {
      if (!config.DEMO_MODE) {
        return null;
      }
    }

    if (config.DEMO_MODE) {
      const userId = this.user?._id || this.user?.id;
      const localProfile = await getLocalDemoDriverProfile(userId);
      if (localProfile?._id || localProfile?.id) {
        this.driver = localProfile;
        return localProfile;
      }
    }

    this.driver = null;
    return null;
  }

  async getDriverProfile() {
    const driverProfile = await this.fetchDriverByUserId();
    if (!driverProfile) {
      throw new Error('Driver profile not found');
    }
    return driverProfile;
  }

  async updateUser(userData) {
    return await this.apiCall('/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Update driver profile
  async updateDriverProfile(profileData) {
    const updatedDriver = await this.apiCall('/drivers/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    this.driver = updatedDriver;
    await this.saveDriverToStorage();
    return updatedDriver;
  }

  async updateDriver(data) {
    this.driver = await this.apiCall(`/resource/drivers/${this.driver._id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    await this.saveDriverToStorage();
    return this.driver;
  }

  async uploadFile(asset) {
    const uri = typeof asset === 'string' ? asset : asset.uri;
    const mimeType = typeof asset === 'string'
      ? 'image/jpeg'
      : (asset.mimeType || 'image/jpeg');
    const name = typeof asset === 'string'
      ? 'upload.jpg'
      : (asset.fileName || 'upload.jpg');
    const formData = new FormData();
    formData.append('image', {
      uri,
      type: mimeType,
      name,
    });

    const data = await this.apiCallMultipart('/upload', {
      method: 'POST',
      body: formData,
    });
    return data.url;
  }

  async uploadPublicFile(asset, folder = 'avatars') {
    const uri = typeof asset === 'string' ? asset : asset.uri;
    const formData = new FormData();
    formData.append('folder', folder);
    formData.append('image', {
      uri,
      type: typeof asset === 'string' ? 'image/jpeg' : (asset.mimeType || 'image/jpeg'),
      name: typeof asset === 'string' ? 'upload.jpg' : (asset.fileName || 'upload.jpg'),
    });

    const data = await this.apiCallMultipart('/upload/public', {
      method: 'POST',
      body: formData,
    });
    return data.url;
  }

  async uploadDriverDocument(docType, asset) {
    const driver = this.driver || await this.getDriverProfile();
    const documents = driver.documents || [];

    if (documents.some((doc) => doc.type === docType)) {
      throw new Error('Document already added');
    }

    const fileUrl = await this.uploadFile(asset);
    return await this.updateDriverProfile({
      documents: [...documents, { type: docType, fileUrl }],
    });
  }

  // Récupérer les settings de l'application
  async getSettings() {
    return await this.apiCall('/resource/settings');
  }

  // Récupérer les restaurants proches
  async getNearbyRestaurants(latitude, longitude, radius = 10) {
    try {
      // Pour l'instant, récupérer tous les restaurants et filtrer côté client
      // TODO: Implémenter une route API côté serveur pour calculer la distance
      const restaurants = await this.apiCall('/resource/restaurants');

      // Filtrer les restaurants avec des coordonnées valides
      const nearbyRestaurants = restaurants.filter(restaurant => {
        if (!restaurant.latitude || !restaurant.longitude) return false;

        const restaurantLat = parseFloat(restaurant.latitude);
        const restaurantLng = parseFloat(restaurant.longitude);

        if (isNaN(restaurantLat) || isNaN(restaurantLng)) return false;

        // Calcul de distance simple (en km) - approximation
        const distance = this.calculateDistance(latitude, longitude, restaurantLat, restaurantLng);

        // Ajouter la distance calculée au restaurant
        restaurant.distance = distance;

        return distance <= radius && restaurant.isActivated;
      });

      return nearbyRestaurants.sort((a, b) => a.distance - b.distance);
    } catch (error) {
      console.error('Error fetching nearby restaurants:', error);
      return [];
    }
  }

  // Fonction utilitaire pour calculer la distance entre deux points (formule de Haversine)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
}

// Instance unique de l'API client
const apiClient = new ApiClient();

export default apiClient;

// Fonctions d'export pour faciliter l'utilisation
export const {
  driverLogin,
  driverRegister,
  updateDriverStatus,
  getAvailableDeliveries,
  acceptDelivery,
  getDriverDeliveries,
  updateDeliveryStatus,
  getDriverStats,
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  logout,
  getDriverProfile,
  createDriverProfile,
  updateUser,
  updateDriverProfile,
  updateDriver,
  uploadDriverDocument,
} = apiClient;

// Export séparé pour getSettings (comme dans customer-app)
export const getSettings = () => apiClient.getSettings();
export const getNearbyRestaurants = (latitude, longitude, radius) => apiClient.getNearbyRestaurants(latitude, longitude, radius);
