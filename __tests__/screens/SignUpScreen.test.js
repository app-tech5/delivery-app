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
        'auth.signUp': 'Sign Up',
        'auth.signUpSubtitle': 'Create your driver account',
        'auth.signUpFieldsRequired': 'Name, email and password are required',
        'auth.passwordsDoNotMatch': 'Passwords do not match',
        'auth.signUpSuccessful': 'Registration successful',
        'auth.signUpError': 'Registration failed',
        'auth.signingUp': 'Signing up...',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.confirmPassword': 'Confirm Password',
        'auth.alreadyHaveAccount': 'Already have an account?',
        'auth.signIn': 'Sign In',
        'profile.fullName': 'Full Name',
        'profile.phone': 'Phone',
      };
      return translations[key] || key;
    }),
  },
}));

jest.mock('../../config', () => ({
  config: {
    APP_NAME: 'Good Food Driver',
  },
}));

const mockRegister = jest.fn();

jest.mock('../../contexts/DriverContext', () => ({
  useDriver: () => ({
    register: mockRegister,
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
      rightIcon && mockReact.cloneElement(rightIcon, { testID: `toggle-${placeholder}` })
    );

  const Button = ({ title, onPress, loading, disabled }) =>
    mockReact.createElement(
      TouchableOpacity,
      {
        onPress,
        testID: `button-${title}`,
        disabled: disabled || loading,
      },
      loading
        ? mockReact.createElement(ActivityIndicator, { testID: 'loading-indicator' })
        : mockReact.createElement(Text, null, title)
    );

  const Icon = ({ name, onPress, ...props }) =>
    onPress
      ? mockReact.createElement(TouchableOpacity, {
          testID: `icon-${name}`,
          onPress,
          ...props,
        })
      : mockReact.createElement(View, { testID: `icon-${name}`, ...props });

  return { Input, Button, Icon };
});

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, TouchableOpacity } from 'react-native';
import SignUpScreen from '../../screens/SignUpScreen';

describe('SignUpScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

  const fillRequiredFields = (getByTestId, overrides = {}) => {
    const values = {
      name: 'John Driver',
      email: 'john@test.com',
      phone: '0612345678',
      password: 'secret123',
      confirmPassword: 'secret123',
      ...overrides,
    };

    fireEvent.changeText(getByTestId('text-input-Full Name'), values.name);
    fireEvent.changeText(getByTestId('text-input-Email'), values.email);
    fireEvent.changeText(getByTestId('text-input-Phone'), values.phone);
    fireEvent.changeText(getByTestId('text-input-Password'), values.password);
    fireEvent.changeText(getByTestId('text-input-Confirm Password'), values.confirmPassword);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRegister.mockReset();
  });

  afterEach(() => {
    mockAlert.mockClear();
  });

  it('renders the sign-up form with app title and fields', () => {
    const { getByText, getByTestId } = render(
      <SignUpScreen navigation={mockNavigation} />
    );

    expect(getByText('Good Food Driver')).toBeTruthy();
    expect(getByText('Create your driver account')).toBeTruthy();
    expect(getByTestId('text-input-Full Name')).toBeTruthy();
    expect(getByTestId('text-input-Email')).toBeTruthy();
    expect(getByTestId('text-input-Phone')).toBeTruthy();
    expect(getByTestId('text-input-Password')).toBeTruthy();
    expect(getByTestId('text-input-Confirm Password')).toBeTruthy();
    expect(getByTestId('button-Sign Up')).toBeTruthy();
    expect(getByText(/Already have an account\?/)).toBeTruthy();
  });

  it('shows an alert when required fields are empty', async () => {
    const { getByTestId } = render(
      <SignUpScreen navigation={mockNavigation} />
    );

    fireEvent.press(getByTestId('button-Sign Up'));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Name, email and password are required');
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows an alert when passwords do not match', async () => {
    const { getByTestId } = render(
      <SignUpScreen navigation={mockNavigation} />
    );

    fillRequiredFields(getByTestId, { confirmPassword: 'different' });
    fireEvent.press(getByTestId('button-Sign Up'));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Passwords do not match');
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('calls register with entered data', async () => {
    mockRegister.mockResolvedValue({ token: 'abc', user: { id: '1' } });

    const { getByTestId } = render(
      <SignUpScreen navigation={mockNavigation} />
    );

    fillRequiredFields(getByTestId);
    fireEvent.press(getByTestId('button-Sign Up'));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'John Driver',
        email: 'john@test.com',
        phone: '0612345678',
        password: 'secret123',
      });
    });
  });

  it('shows a success alert after successful registration', async () => {
    mockRegister.mockResolvedValue({ token: 'abc', user: { id: '1' } });

    const { getByTestId } = render(
      <SignUpScreen navigation={mockNavigation} />
    );

    fillRequiredFields(getByTestId);
    fireEvent.press(getByTestId('button-Sign Up'));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Registration successful');
    });
  });

  it('shows an error alert when registration fails', async () => {
    mockRegister.mockRejectedValue(new Error('Email already exists'));

    const { getByTestId } = render(
      <SignUpScreen navigation={mockNavigation} />
    );

    fillRequiredFields(getByTestId);
    fireEvent.press(getByTestId('button-Sign Up'));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Registration failed', 'Email already exists');
    });
  });

  it('navigates back when the back button is pressed', () => {
    const { UNSAFE_getAllByType } = render(
      <SignUpScreen navigation={mockNavigation} />
    );

    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(touchables[0]);

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('navigates to Login when the sign-in link is pressed', () => {
    const { getByText } = render(
      <SignUpScreen navigation={mockNavigation} />
    );

    fireEvent.press(getByText(/Already have an account\?/));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
  });

  it('toggles password visibility', () => {
    const { getByTestId } = render(
      <SignUpScreen navigation={mockNavigation} />
    );

    expect(getByTestId('text-input-Password').props.secureTextEntry).toBe(true);

    fireEvent.press(getByTestId('toggle-Password'));
    expect(getByTestId('text-input-Password').props.secureTextEntry).toBe(false);

    fireEvent.press(getByTestId('toggle-Password'));
    expect(getByTestId('text-input-Password').props.secureTextEntry).toBe(true);
  });

  it('toggles confirm password visibility', () => {
    const { getByTestId } = render(
      <SignUpScreen navigation={mockNavigation} />
    );

    expect(getByTestId('text-input-Confirm Password').props.secureTextEntry).toBe(true);

    fireEvent.press(getByTestId('toggle-Confirm Password'));
    expect(getByTestId('text-input-Confirm Password').props.secureTextEntry).toBe(false);

    fireEvent.press(getByTestId('toggle-Confirm Password'));
    expect(getByTestId('text-input-Confirm Password').props.secureTextEntry).toBe(true);
  });
});
