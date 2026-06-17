/**
 * Tests d'intégration HomeScreen — chaîne réelle, sans mock des handlers.
 * DriverProvider + useDriverStatus + useDriverOrders + api démo + AsyncStorage.
 *
 * Ces tests DOIVENT échouer tant que le mode démo ne persiste pas les écritures
 * (statut driver, commande livrée) dans le stockage local.
 */

jest.mock('expo-task-manager', () => ({
  isTaskDefined: jest.fn(() => true),
  defineTask: jest.fn(),
}));

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestBackgroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getBackgroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({ coords: { latitude: 4.0982637, longitude: 9.6576275 } })
  ),
  watchPositionAsync: jest.fn(() => Promise.resolve({ remove: jest.fn() })),
  hasStartedLocationUpdatesAsync: jest.fn(() => Promise.resolve(false)),
  startLocationUpdatesAsync: jest.fn(() => Promise.resolve()),
  stopLocationUpdatesAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../tasks/driverLocationTask', () => ({
  DRIVER_LOCATION_TASK: 'driver-background-location',
}));

const storage = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key) =>
    Promise.resolve(Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null)
  ),
  setItem: jest.fn((key, value) => {
    storage[key] = value;
    return Promise.resolve();
  }),
  removeItem: jest.fn((key) => {
    delete storage[key];
    return Promise.resolve();
  }),
  multiRemove: jest.fn((keys) => {
    keys.forEach((key) => delete storage[key]);
    return Promise.resolve();
  }),
}));

jest.mock('../../config', () => ({
  config: {
    API_BASE_URL: 'http://localhost:5000/api',
    API_TIMEOUT: 5000,
    APP_NAME: 'Good Food Driver',
    DEMO_MODE: true,
    DEMO_EMAIL: 'driver@demo.com',
    DEMO_PASSWORD: 'driver123',
  },
}));

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
  })),
}));

jest.mock('../../hooks/useDriverLocationWatch', () => ({
  useDriverLocationWatch: jest.fn(),
}));

jest.mock('../../utils/locationUtils', () => ({
  requestDriverLocationPermissions: jest.fn(() =>
    Promise.resolve({ foreground: true, background: false })
  ),
  startDriverBackgroundLocation: jest.fn(() => Promise.resolve(true)),
  stopDriverBackgroundLocation: jest.fn(() => Promise.resolve(true)),
  getDriverLocation: (driver) =>
    driver?.location?.coordinates
      ? {
          latitude: driver.location.coordinates[1],
          longitude: driver.location.coordinates[0],
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }
      : {
          latitude: 48.8566,
          longitude: 2.3522,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
  getActiveDeliveries: (deliveries) =>
    (deliveries || []).filter((delivery) => delivery.status === 'out_for_delivery'),
}));

jest.mock('../../components/RestaurantMap', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => React.createElement(View, { testID: 'restaurant-map-stub' });
});

jest.mock('../../i18n', () => ({
  __esModule: true,
  default: {
    t: jest.fn((key) => {
      const translations = {
        'home.reconnect': 'Please reconnect',
        'reports.pleaseReconnectHistory': 'Sign in to continue',
        'navigation.login': 'Login',
        'driver.available': 'Available',
        'driver.busy': 'Busy',
        'driver.offline': 'Offline',
        'home.activeDeliveries': 'Active deliveries',
        'driver.onDelivery': 'On delivery',
        'driver.orderDelivered': 'Mark as delivered',
        'driver.simulation': 'simulation',
        'errors.locationError': 'Location unavailable',
        'errors.networkError': 'Network error',
        'errors.permissionDenied': 'Permission denied',
        'driver.notApprovedError': 'Driver not approved',
        'driver.statusUpdateError': 'Status update failed',
        'common.ok': 'OK',
        'common.amount': 'Amount',
      };
      return translations[key] || key;
    }),
  },
}));

jest.mock('react-native-elements', () => {
  const mockReact = require('react');
  const { TouchableOpacity, Text, ActivityIndicator } = require('react-native');

  const Button = ({ title, onPress, loading, testID, buttonStyle }) =>
    mockReact.createElement(
      TouchableOpacity,
      {
        onPress,
        testID: testID || (title === 'Login' ? 'auth-guard-login-button' : `button-${title}`),
        disabled: loading,
        style: buttonStyle,
      },
      loading
        ? mockReact.createElement(ActivityIndicator, { testID: 'loading-indicator' })
        : mockReact.createElement(Text, null, title)
    );

  const Icon = ({ name }) =>
    mockReact.createElement(Text, { testID: `icon-${name}` }, name);

  const Card = ({ children }) =>
    mockReact.createElement(require('react-native').View, null, children);

  return { Button, Icon, Card };
});

const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() };

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../../screens/HomeScreen';
import { DriverProvider } from '../../contexts/DriverContext';
import { SettingProvider } from '../../contexts/SettingContext';
import { getDriverSessionFromCache } from '../../utils/storageUtils';
import { updateDriverCache } from '../../utils/storageUtils';
import { getDemoState } from '../../api/demo/localStore';
import { updateDemoState } from '../../api/demo/localStore';

const ORDER_ID = 'order-int-001';

const ACTIVE_ORDER = {
  _id: ORDER_ID,
  id: ORDER_ID,
  status: 'out_for_delivery',
  delivery: { address: '10 rue Integration' },
  totalPrice: 20,
  user: { name: 'Bob', phone: '0600000000' },
  restaurant: { name: 'Test Resto' },
};

const clearStorage = () => {
  Object.keys(storage).forEach((key) => delete storage[key]);
};

const mockNetworkReads = () => {
  global.fetch = jest.fn().mockImplementation((url) => {
    const path = String(url);

    if (path.includes('/resource/orders')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => [ACTIVE_ORDER],
      });
    }

    if (path.includes('/resource/restaurants')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => [],
      });
    }

    if (path.includes('/resource/settings')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({}),
      });
    }

    if (path.includes('/resource/drivers/byUserId')) {
      return Promise.resolve({
        ok: false,
        status: 404,
        json: async () => ({ message: 'not found' }),
      });
    }

    return Promise.resolve({
      ok: false,
      status: 404,
      json: async () => ({ message: 'not found' }),
    });
  });
};

const seedApprovedDriverSession = async () => {
  const apiClient = require('../../api').default;

  await apiClient.driverLogin('driver@demo.com', 'driver123');
  const profile = await apiClient.createDriverProfile({
    licenseNumber: 'DL-INT-01',
    vehicleType: 'Moto',
    vehicleModel: 'Integration',
    licensePlate: 'INT-001',
  });

  const approvedDriver = {
    ...profile,
    status: 'offline',
    isApproved: true,
    userId: { name: 'Integration Driver', image: null },
  };

  apiClient.driver = approvedDriver;
  await apiClient.saveDriverToStorage();
  await updateDriverCache(approvedDriver, apiClient.token, apiClient.user);

  const userId = apiClient.user._id || apiClient.user.id;
  await updateDemoState((current) => ({
    ...current,
    driverProfiles: {
      ...current.driverProfiles,
      [String(userId)]: approvedDriver,
    },
  }));

  return approvedDriver;
};

const renderHomeScreen = () =>
  render(
    <DriverProvider>
      <SettingProvider>
        <HomeScreen />
      </SettingProvider>
    </DriverProvider>
  );

const waitForHomeDashboard = async (utils) => {
  await waitFor(
    () => {
      expect(utils.getByTestId('status-button-available')).toBeTruthy();
    },
    { timeout: 8000 }
  );
};

const waitForActiveDeliveryButton = async (utils) => {
  await waitFor(
    () => {
      expect(utils.getByTestId(`delivery-delivered-${ORDER_ID}`)).toBeTruthy();
    },
    { timeout: 8000 }
  );
};

describe('HomeScreen integration (demo mode, real hooks)', () => {
  let alertSpy;

  beforeEach(() => {
    clearStorage();
    jest.clearAllMocks();
    mockNetworkReads();
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy?.mockRestore();
  });

  describe('Login button (AuthGuard)', () => {
    it('navigates to Login when the user has no session', async () => {
      const utils = renderHomeScreen();

      await waitFor(() => {
        expect(utils.getByTestId('auth-guard-login-button')).toBeTruthy();
      });

      fireEvent.press(utils.getByTestId('auth-guard-login-button'));

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
    });
  });

  describe('Status buttons (Available / Busy / Offline)', () => {
    it('shows the new status on screen during the same session', async () => {
      await seedApprovedDriverSession();
      const utils = renderHomeScreen();
      await waitForHomeDashboard(utils);

      fireEvent.press(utils.getByTestId('status-button-available'));

      await waitFor(() => {
        expect(utils.getByText('available')).toBeTruthy();
      });
    });

    it('persists driver status in AsyncStorage after pressing Available', async () => {
      await seedApprovedDriverSession();
      const utils = renderHomeScreen();
      await waitForHomeDashboard(utils);

      fireEvent.press(utils.getByTestId('status-button-available'));

      await waitFor(() => {
        expect(utils.getByText('available')).toBeTruthy();
      });

      const session = await getDriverSessionFromCache();
      expect(session?.driver?.status).toBe('available');
    });

    it('restores driver status after simulated app restart (Available)', async () => {
      await seedApprovedDriverSession();
      const first = renderHomeScreen();
      await waitForHomeDashboard(first);

      fireEvent.press(first.getByTestId('status-button-available'));
      await waitFor(() => expect(first.getByText('available')).toBeTruthy());

      first.unmount();

      const second = renderHomeScreen();
      await waitForHomeDashboard(second);

      expect(second.getByText('available')).toBeTruthy();
    });

    it('persists Busy status after simulated app restart', async () => {
      await seedApprovedDriverSession();
      const first = renderHomeScreen();
      await waitForHomeDashboard(first);

      fireEvent.press(first.getByTestId('status-button-busy'));
      await waitFor(() => expect(first.getByText('busy')).toBeTruthy());

      first.unmount();

      const second = renderHomeScreen();
      await waitForHomeDashboard(second);

      expect(second.getByText('busy')).toBeTruthy();
    });

    it('persists Offline status after simulated app restart', async () => {
      await seedApprovedDriverSession();
      const first = renderHomeScreen();
      await waitForHomeDashboard(first);

      fireEvent.press(first.getByTestId('status-button-available'));
      await waitFor(() => expect(first.getByText('available')).toBeTruthy());

      fireEvent.press(first.getByTestId('status-button-offline'));
      await waitFor(() => expect(first.getByText('offline')).toBeTruthy());

      first.unmount();

      const second = renderHomeScreen();
      await waitForHomeDashboard(second);

      expect(second.getByText('offline')).toBeTruthy();
    });

    it('blocks going online when driver is not approved', async () => {
      await seedApprovedDriverSession();
      const session = await getDriverSessionFromCache();
      const notApproved = { ...session.driver, isApproved: false, status: 'offline' };
      await updateDriverCache(notApproved, session.token, session.user);
      const apiClient = require('../../api').default;
      apiClient.driver = notApproved;
      await apiClient.saveDriverToStorage();

      const utils = renderHomeScreen();
      await waitForHomeDashboard(utils);

      fireEvent.press(utils.getByTestId('status-button-available'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Permission denied', 'Driver not approved');
      });

      expect(utils.getByText('offline')).toBeTruthy();
      const reloaded = await getDriverSessionFromCache();
      expect(reloaded?.driver?.status).toBe('offline');
    });
  });

  describe('Mark as delivered button (ActiveDeliveries)', () => {
    it('hides the delivery card in the same session after Mark as delivered', async () => {
      await seedApprovedDriverSession();
      const utils = renderHomeScreen();
      await waitForHomeDashboard(utils);
      await waitForActiveDeliveryButton(utils);

      fireEvent.press(utils.getByTestId(`delivery-delivered-${ORDER_ID}`));

      await waitFor(() => {
        expect(utils.queryByTestId(`delivery-delivered-${ORDER_ID}`)).toBeNull();
      });
    });

    it('persists delivered order in demo local store after Mark as delivered', async () => {
      await seedApprovedDriverSession();
      const utils = renderHomeScreen();
      await waitForHomeDashboard(utils);
      await waitForActiveDeliveryButton(utils);

      fireEvent.press(utils.getByTestId(`delivery-delivered-${ORDER_ID}`));

      await waitFor(() => {
        expect(utils.queryByTestId(`delivery-delivered-${ORDER_ID}`)).toBeNull();
      });

      const demoState = await getDemoState();
      expect(demoState.orderPatches[ORDER_ID]?.status).toBe('delivered');
    });

    it('does not show the delivery as active after simulated app restart', async () => {
      await seedApprovedDriverSession();
      const first = renderHomeScreen();
      await waitForHomeDashboard(first);
      await waitForActiveDeliveryButton(first);

      fireEvent.press(first.getByTestId(`delivery-delivered-${ORDER_ID}`));
      await waitFor(() => {
        expect(first.queryByTestId(`delivery-delivered-${ORDER_ID}`)).toBeNull();
      });

      first.unmount();

      const second = renderHomeScreen();
      await waitForHomeDashboard(second);

      await waitFor(() => {
        expect(second.queryByTestId(`delivery-delivered-${ORDER_ID}`)).toBeNull();
      });
    });
  });
});
