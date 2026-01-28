// API Client pour l'application delivery
import { config } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = config.API_BASE_URL;
const API_TIMEOUT = config.API_TIMEOUT;

class ApiClient {
  constructor() {
    this.token = null;
    this.driver = null;
    this.initializeFromStorage();
  }

  // Initialisation automatique depuis AsyncStorage
  async initializeFromStorage() {
    try {
      const token = await AsyncStorage.getItem('driverToken');
      const driverData = await AsyncStorage.getItem('driverData');

      if (token) {
        this.token = token;
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
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const config = {
        headers: this.getHeaders(),
        ...options,
      };

      // Créer un AbortController pour le timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      config.signal = controller.signal;

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - vérifiez votre connexion');
      }
      console.error(`API call failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Authentification driver - utilise la même route login que les utilisateurs
  async driverLogin(email, password) {
    try {
      const response = await this.apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.token && response.user) {
        this.token = response.token;
        this.user = response.user;

        // Vérifier si cet utilisateur a un profil driver
        try {
          const driverProfile = await this.apiCall('/drivers/profile');
          this.driver = driverProfile;
        } catch (driverError) {
          // L'utilisateur n'a pas de profil driver
          console.log('Utilisateur connecté mais pas de profil driver:', driverError);
          throw new Error('Vous n\'êtes pas enregistré en tant que livreur');
        }

        await this.saveDriverToStorage();
        return response;
      }

      throw new Error('Authentification échouée');
    } catch (error) {
      console.error('Driver login error:', error);
      throw error;
    }
  }

  async driverRegister(driverData) {
    try {
      // D'abord créer un compte utilisateur normal
      const userResponse = await this.apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          email: driverData.email,
          password: driverData.password,
          name: driverData.name,
          phone: driverData.phone,
        }),
      });

      if (userResponse.token && userResponse.user) {
        this.token = userResponse.token;
        this.user = userResponse.user;

        // Ensuite créer le profil driver
        const driverProfile = await this.apiCall('/drivers', {
          method: 'POST',
          body: JSON.stringify({
            userId: userResponse.user.id,
            licenseNumber: driverData.licenseNumber,
            vehicle: driverData.vehicle,
          }),
        });

        this.driver = driverProfile;
        await this.saveDriverToStorage();

        return {
          ...userResponse,
          driver: driverProfile
        };
      }

      throw new Error('Erreur lors de l\'inscription');
    } catch (error) {
      console.error('Driver register error:', error);
      throw error;
    }
  }

  // Gestion du statut du driver
  async updateDriverStatus(status, location = null) {
    const updateData = { status };
    if (location) {
      updateData.location = {
        type: 'Point',
        coordinates: [location.longitude, location.latitude]
      };
    }

    return await this.apiCall('/drivers/status', {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Récupération des commandes disponibles pour livraison
  async getAvailableOrders() {
    return await this.apiCall('/resource/orders?status=preparing');
  }

  // Accepter une commande pour livraison
  async acceptOrder(orderId) {
    return await this.apiCall(`/resource/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({
        driver: this.driver._id,
        status: 'out_for_delivery'
      }),
    });
  }

  // Récupérer les commandes du driver
  async getDriverOrders(status = null) {
    let query = `driver=${this.driver._id}`;
    if (status) {
      query += `&status=${status}`;
    }
    return await this.apiCall(`/resource/orders?${query}`);
  }

  // Mettre à jour le statut d'une commande
  async updateOrderStatus(orderId, status) {
    return await this.apiCall(`/resource/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Récupérer les statistiques du driver
  async getDriverStats() {
    try {
      // Pour l'instant, calculer les stats depuis les orders du driver
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
        totalEarnings: orders
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

  // Déconnexion
  async logout() {
    this.token = null;
    this.driver = null;
    await AsyncStorage.removeItem('driverToken');
    await AsyncStorage.removeItem('driverData');
  }

  // Récupérer le profil du driver
  async getDriverProfile() {
    return await this.apiCall('/drivers/profile');
  }

  // Mettre à jour le profil du driver
  async updateDriverProfile(profileData) {
    return await this.apiCall('/drivers/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
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
  logout,
  getDriverProfile,
  updateDriverProfile,
} = apiClient;
