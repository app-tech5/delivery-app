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
        'errors.locationError': 'Location unavailable',
        'common.amount': 'Amount',
        'home.currentLocation': 'Current location',
        'home.mapMarkerDriver': 'You',
        'home.mapMarkerDriverSubtitle': 'Driver position',
        'home.loadingRestaurants': 'Loading restaurants...',
        'home.deliveryAvailable': 'Delivery available',
        'home.deliveryUnavailable': 'Delivery unavailable',
      };
      return translations[key] || key;
    }),
  },
}));

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

const mockLoadDriverStats = jest.fn();
const mockLoadDriverOrders = jest.fn();
const mockHandleStatusChange = jest.fn();
const mockHandleOrderStatusChange = jest.fn();

const mockUseDriver = jest.fn();

jest.mock('../../contexts/DriverContext', () => ({
  useDriver: () => mockUseDriver(),
}));

jest.mock('../../contexts/SettingContext', () => ({
  useSettings: () => ({
    currency: { symbol: '€', code: 'EUR' },
  }),
}));

jest.mock('../../hooks', () => ({
  useNearbyRestaurants: jest.fn(() => ({
    nearbyRestaurants: [],
    restaurantsLoading: false,
  })),
  useDriverStatus: jest.fn(() => ({
    isLoading: false,
    handleStatusChange: mockHandleStatusChange,
    handleOrderStatusChange: mockHandleOrderStatusChange,
  })),
}));

jest.mock('../../utils', () => ({
  getDriverLocation: jest.fn(() => ({ latitude: 4.0982637, longitude: 9.6576275 })),
  getActiveDeliveries: jest.fn((deliveries) =>
    (deliveries || []).filter((item) => item.status === 'out_for_delivery')
  ),
  getStatusColor: jest.fn(() => '#4CAF50'),
  formatCurrency: jest.fn((amount) => `${amount} €`),
  truncateText: jest.fn((text) => text),
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

  return { Button, Icon, Card: ({ children }) => mockReact.createElement(require('react-native').View, null, children) };
});

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    SafeAreaView: ({ children, style, edges, testID }) =>
      React.createElement(
        View,
        { style, testID: testID || 'safe-area-view', accessibilityLabel: edges?.join(',') },
        children
      ),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('../../components', () => {
  const mockReact = require('react');
  const { View } = require('react-native');

  return {
    AuthGuard: jest.requireActual('../../components/AuthGuard').default,
    ScreenLayout: jest.requireActual('../../components/ScreenLayout').default,
    ScreenHeader: jest.requireActual('../../components/ScreenHeader').default,
    StatusButtons: jest.requireActual('../../components/StatusButtons').default,
    DriverStats: () => mockReact.createElement(View, { testID: 'driver-stats' }),
    ActiveDeliveries: jest.requireActual('../../components/ActiveDeliveries').default,
    RestaurantMap: () => mockReact.createElement(View, { testID: 'restaurant-map' }),
  };
});

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../../screens/HomeScreen';
import { useDriverStatus } from '../../hooks';

const baseDriver = {
  _id: 'driver-1',
  status: 'offline',
  isApproved: true,
  licenseNumber: 'DL-12345',
  userId: { name: 'John Driver', image: null },
};

const activeDelivery = {
  _id: 'order-active-123456',
  status: 'out_for_delivery',
  delivery: { address: '123 Main St' },
  user: { name: 'Alice', phone: '0600000000' },
  restaurant: { name: 'Pizza Place' },
  totalPrice: 25,
};

const setupDriverContext = ({
  hasCompletedOnboarding = true,
  driver = baseDriver,
  deliveries = [activeDelivery],
  stats = { totalDeliveries: 10, totalEarnings: 500 },
} = {}) => {
  mockUseDriver.mockReturnValue({
    driver: hasCompletedOnboarding ? driver : null,
    stats,
    deliveries,
    loadDriverStats: mockLoadDriverStats,
    loadDriverOrders: mockLoadDriverOrders,
    hasCompletedOnboarding,
  });
};

describe('HomeScreen buttons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useDriverStatus.mockReturnValue({
      isLoading: false,
      handleStatusChange: mockHandleStatusChange,
      handleOrderStatusChange: mockHandleOrderStatusChange,
    });
    setupDriverContext();
  });

  it('shows login button and navigates to Login when pressed', () => {
    setupDriverContext({ hasCompletedOnboarding: false, driver: null, deliveries: [] });

    const { getByTestId, queryByTestId } = render(<HomeScreen />);

    expect(getByTestId('auth-guard-login-button')).toBeTruthy();
    expect(queryByTestId('status-button-available')).toBeNull();

    fireEvent.press(getByTestId('auth-guard-login-button'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
  });

  it('loads driver data when onboarding is completed', async () => {
    render(<HomeScreen />);

    await waitFor(() => {
      expect(mockLoadDriverStats).toHaveBeenCalled();
      expect(mockLoadDriverOrders).toHaveBeenCalled();
    });
  });

  it('does not load driver data when onboarding is not completed', async () => {
    setupDriverContext({ hasCompletedOnboarding: false, driver: null, deliveries: [] });

    render(<HomeScreen />);

    await waitFor(() => {
      expect(mockLoadDriverStats).not.toHaveBeenCalled();
      expect(mockLoadDriverOrders).not.toHaveBeenCalled();
    });
  });

  it('calls handleStatusChange with available when Available is pressed', () => {
    const { getByTestId } = render(<HomeScreen />);

    fireEvent.press(getByTestId('status-button-available'));

    expect(mockHandleStatusChange).toHaveBeenCalledWith('available');
  });

  it('calls handleStatusChange with busy when Busy is pressed', () => {
    const { getByTestId } = render(<HomeScreen />);

    fireEvent.press(getByTestId('status-button-busy'));

    expect(mockHandleStatusChange).toHaveBeenCalledWith('busy');
  });

  it('calls handleStatusChange with offline when Offline is pressed', () => {
    const { getByTestId } = render(<HomeScreen />);

    fireEvent.press(getByTestId('status-button-offline'));

    expect(mockHandleStatusChange).toHaveBeenCalledWith('offline');
  });

  it('disables status buttons while status update is loading', () => {
    useDriverStatus.mockReturnValue({
      isLoading: true,
      handleStatusChange: mockHandleStatusChange,
      handleOrderStatusChange: mockHandleOrderStatusChange,
    });

    const { getByTestId } = render(<HomeScreen />);

    const availableButton = getByTestId('status-button-available');
    const busyButton = getByTestId('status-button-busy');
    const offlineButton = getByTestId('status-button-offline');

    expect(
      availableButton.props.disabled === true ||
        availableButton.props.accessibilityState?.disabled === true
    ).toBe(true);
    expect(
      busyButton.props.disabled === true ||
        busyButton.props.accessibilityState?.disabled === true
    ).toBe(true);
    expect(
      offlineButton.props.disabled === true ||
        offlineButton.props.accessibilityState?.disabled === true
    ).toBe(true);

    fireEvent.press(availableButton);

    expect(mockHandleStatusChange).not.toHaveBeenCalled();
  });

  it('calls handleOrderStatusChange when Mark as delivered is pressed', () => {
    const { getByTestId } = render(<HomeScreen />);

    fireEvent.press(getByTestId('delivery-delivered-order-active-123456'));

    expect(mockHandleOrderStatusChange).toHaveBeenCalledWith(
      'order-active-123456',
      'delivered'
    );
  });

  it('does not show delivery action button when there are no active deliveries', () => {
    setupDriverContext({ deliveries: [] });

    const { queryByTestId } = render(<HomeScreen />);

    expect(queryByTestId('delivery-delivered-order-active-123456')).toBeNull();
  });

  it('renders driver dashboard sections when onboarding is completed', () => {
    const { getByTestId, getByText } = render(<HomeScreen />);

    expect(getByTestId('home-screen-safe-area')).toBeTruthy();
    expect(getByTestId('screen-header')).toBeTruthy();
    expect(getByText('John Driver')).toBeTruthy();
    expect(getByText('ID: DL-12345')).toBeTruthy();
    expect(getByTestId('status-button-available')).toBeTruthy();
    expect(getByTestId('driver-stats')).toBeTruthy();
    expect(getByText('Active deliveries')).toBeTruthy();
    expect(getByTestId('restaurant-map')).toBeTruthy();
  });
});
