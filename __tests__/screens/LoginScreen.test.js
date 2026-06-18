jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  mergeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
  multiMerge: jest.fn(),
}));

jest.mock('../../i18n', () => ({
  __esModule: true,
  default: {
    t: jest.fn((key) => {
      const translations = {
        'auth.signIn': 'Sign In',
        'auth.signInSubtitle': 'Sign in to your account',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.emailAndPasswordRequired': 'Email and password are required',
        'auth.loginSuccessful': 'Login successful',
        'auth.loginError': 'Login failed',
        'auth.loginFailedDefault': 'Incorrect email or password',
        'auth.driverNotFound': 'You are not registered as a driver',
        'auth.noAccountSignUp': 'No account yet? Sign Up',
        'auth.forgotPassword': 'Forgot password?',
        'auth.comingSoon': 'Coming soon',
        'auth.demoMode': 'Demo Mode Active',
      };
      return translations[key] || key;
    }),
  },
}));

jest.mock('../../config', () => {
  const actual = jest.requireActual('../../config');
  return {
    ...actual,
    config: { ...actual.config, DEMO_MODE: false },
  };
});

const mockLogin = jest.fn();

jest.mock('../../contexts/DriverContext', () => ({
  useDriver: () => ({
    login: mockLogin,
  }),
}));

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return { LinearGradient: View };
});

jest.mock('react-native-animatable', () => {
  const { View } = require('react-native');
  return { View };
});

jest.mock('react-native-elements', () => {
  const mockReact = require('react');
  const { View, TextInput, TouchableOpacity, Text, ActivityIndicator } = require('react-native');

  const Input = ({ placeholder, value, onChangeText, leftIcon, rightIcon, secureTextEntry }) =>
    mockReact.createElement(
      View,
      { testID: `input-${placeholder}` },
      leftIcon,
      mockReact.createElement(TextInput, {
        placeholder,
        value,
        onChangeText,
        secureTextEntry,
        testID: `text-input-${placeholder}`,
      }),
      rightIcon
    );

  const Button = ({ title, onPress, loading }) =>
    mockReact.createElement(
      TouchableOpacity,
      {
        onPress,
        testID: `button-${title}`,
        disabled: loading,
      },
      loading
        ? mockReact.createElement(ActivityIndicator, { testID: 'loading-indicator' })
        : mockReact.createElement(Text, null, title)
    );

  const Icon = ({ name, onPress, ...props }) =>
    mockReact.createElement(TouchableOpacity, {
      testID: `icon-${name}`,
      onPress,
      ...props,
    });

  return { Input, Button, Icon };
});

jest.mock('../../components', () => {
  const mockReact = require('react');
  const { View, Text } = require('react-native');

  const ScreenHeader = ({ title, subtitle, children, titleStyle, subtitleStyle }) =>
    mockReact.createElement(
      View,
      { testID: 'screen-header' },
      title ? mockReact.createElement(Text, { style: titleStyle }, title) : null,
      subtitle ? mockReact.createElement(Text, { style: subtitleStyle }, subtitle) : null,
      children
    );

  return { ScreenHeader };
});

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import LoginScreen from '../../screens/LoginScreen';

describe('LoginScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  const { config } = require('../../config');

  const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

  beforeEach(() => {
    config.DEMO_MODE = false;
    jest.clearAllMocks();
    mockLogin.mockReset();
  });

  afterEach(() => {
    mockAlert.mockClear();
  });

  it('renders the login form with app title and fields', () => {
    const { getByText, getByTestId } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    expect(getByText('Good Food Driver')).toBeTruthy();
    expect(getByText('Sign in to your account')).toBeTruthy();
    expect(getByTestId('text-input-Email')).toBeTruthy();
    expect(getByTestId('text-input-Password')).toBeTruthy();
    expect(getByTestId('button-Sign In')).toBeTruthy();
    expect(getByTestId('button-No account yet? Sign Up')).toBeTruthy();
    expect(getByTestId('button-Forgot password?')).toBeTruthy();
  });

  it('shows an alert when submitting with empty fields', async () => {
    const { getByTestId } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    fireEvent.press(getByTestId('button-Sign In'));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Email and password are required');
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login with entered credentials', async () => {
    mockLogin.mockResolvedValue({ token: 'abc', user: { id: '1' } });

    const { getByTestId } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    fireEvent.changeText(getByTestId('text-input-Email'), 'driver@test.com');
    fireEvent.changeText(getByTestId('text-input-Password'), 'secret123');
    fireEvent.press(getByTestId('button-Sign In'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('driver@test.com', 'secret123');
    });
  });

  it('shows a success alert after a successful login', async () => {
    mockLogin.mockResolvedValue({ token: 'abc', user: { id: '1' } });

    const { getByTestId } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    fireEvent.changeText(getByTestId('text-input-Email'), 'driver@test.com');
    fireEvent.changeText(getByTestId('text-input-Password'), 'secret123');
    fireEvent.press(getByTestId('button-Sign In'));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Login successful');
    });
  });

  it('shows a generic error alert when login fails', async () => {
    mockLogin.mockRejectedValue(new Error('Network error'));

    const { getByTestId } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    fireEvent.changeText(getByTestId('text-input-Email'), 'driver@test.com');
    fireEvent.changeText(getByTestId('text-input-Password'), 'wrong');
    fireEvent.press(getByTestId('button-Sign In'));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Login failed', 'Network error');
    });
  });

  it('shows driver-not-found message when profile is missing', async () => {
    mockLogin.mockRejectedValue(new Error('Driver profile not found'));

    const { getByTestId } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    fireEvent.changeText(getByTestId('text-input-Email'), 'driver@test.com');
    fireEvent.changeText(getByTestId('text-input-Password'), 'secret123');
    fireEvent.press(getByTestId('button-Sign In'));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        'Login failed',
        'You are not registered as a driver'
      );
    });
  });

  it('navigates to SignUp when the sign-up button is pressed', () => {
    const { getByTestId } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    fireEvent.press(getByTestId('button-No account yet? Sign Up'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('SignUp');
  });

  it('shows coming soon alert when forgot password is pressed', () => {
    const { getByTestId } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    fireEvent.press(getByTestId('button-Forgot password?'));

    expect(mockAlert).toHaveBeenCalledWith('Coming soon');
  });

  it('toggles password visibility when the visibility icon is pressed', () => {
    const { getByTestId } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    expect(getByTestId('text-input-Password').props.secureTextEntry).toBe(true);

    fireEvent.press(getByTestId('icon-visibility'));
    expect(getByTestId('text-input-Password').props.secureTextEntry).toBe(false);

    fireEvent.press(getByTestId('icon-visibility-off'));
    expect(getByTestId('text-input-Password').props.secureTextEntry).toBe(true);
  });

  it('prefills credentials and shows demo banner in demo mode', () => {
    config.DEMO_MODE = true;

    const { getByDisplayValue, getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    expect(getByDisplayValue(config.DEMO_EMAIL)).toBeTruthy();
    expect(getByDisplayValue(config.DEMO_PASSWORD)).toBeTruthy();
    expect(getByText('Demo Mode Active')).toBeTruthy();
  });
});
