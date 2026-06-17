jest.mock('../../i18n', () => ({
  __esModule: true,
  default: {
    t: jest.fn((key) => {
      const translations = {
        'home.reconnect': 'Please reconnect',
        'reports.pleaseReconnectHistory': 'Sign in to view your history',
        'navigation.login': 'Login',
      };
      return translations[key] || key;
    }),
  },
}));

jest.mock('react-native-elements', () => {
  const mockReact = require('react');
  const { TouchableOpacity, Text } = require('react-native');

  const Button = ({ title, onPress, buttonStyle }) =>
    mockReact.createElement(
      TouchableOpacity,
      { onPress, testID: 'auth-guard-login-button', style: buttonStyle },
      mockReact.createElement(Text, null, title)
    );

  return { Button };
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AuthGuard from '../../components/AuthGuard';

describe('AuthGuard', () => {
  const driver = { _id: 'driver-1' };

  it('renders nothing when the driver is authenticated', () => {
    const { toJSON } = render(
      <AuthGuard isAuthenticated driver={driver} />
    );

    expect(toJSON()).toBeNull();
  });

  it('shows reconnect message when user is not signed in', () => {
    const { getByText } = render(
      <AuthGuard isAuthenticated={false} driver={null} />
    );

    expect(getByText('Please reconnect')).toBeTruthy();
    expect(getByText('Sign in to view your history')).toBeTruthy();
  });

  it('shows login button and calls onLoginPress', () => {
    const onLoginPress = jest.fn();
    const { getByTestId } = render(
      <AuthGuard
        isAuthenticated={false}
        driver={null}
        showLoginButton
        onLoginPress={onLoginPress}
      />
    );

    fireEvent.press(getByTestId('auth-guard-login-button'));

    expect(onLoginPress).toHaveBeenCalled();
  });
});
