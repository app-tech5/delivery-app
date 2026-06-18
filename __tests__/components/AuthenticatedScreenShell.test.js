/**
 * Test du shell commun (AuthGuard + ScreenLayout).
 * Couvre le pattern utilisé par Home, Deliveries, History, etc.
 * sans dupliquer un fichier de test par écran.
 */

import React from 'react';
import { Text, View } from 'react-native';
import { render } from '@testing-library/react-native';
import AuthGuard from '../../components/AuthGuard';
import ScreenLayout from '../../components/ScreenLayout';
import {
  expectActiveScreenShell,
  expectHeaderClearsStatusBar,
  expectInactiveScreenShell,
  isShellBroken,
  SHELL_TEST_IDS,
} from '../helpers/screenShellAssertions';

jest.mock('../../i18n', () => ({
  __esModule: true,
  default: {
    t: (key) =>
      ({
        'home.reconnect': 'Please reconnect',
        'reports.pleaseReconnectHistory': 'Sign in to continue',
        'navigation.login': 'Login',
      }[key] || key),
  },
}));

jest.mock('react-native-elements', () => {
  const React = require('react');
  const { TouchableOpacity, Text: RNText } = require('react-native');

  return {
    Button: ({ title, onPress }) =>
      React.createElement(
        TouchableOpacity,
        { onPress, testID: 'auth-guard-login-button' },
        React.createElement(RNText, null, title)
      ),
  };
});

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    SafeAreaView: ({ children, style, edges, testID }) =>
      React.createElement(View, {
        style,
        testID,
        accessibilityLabel: edges?.join(','),
      }, children),
    useSafeAreaInsets: () => ({ top: 47, bottom: 34, left: 0, right: 0 }),
  };
});

const driver = { _id: 'driver-1' };

function ScreenShellFixture({
  isAuthenticated = false,
  driver: driverProp = null,
  showMainContent = false,
  screenTestID = 'fixture-screen',
}) {
  return (
    <View style={{ flex: 1 }}>
      <AuthGuard isAuthenticated={isAuthenticated} driver={driverProp} showLoginButton />
      {showMainContent && (
        <ScreenLayout testID={screenTestID} title="Fixture" subtitle="Shell test">
          <Text testID="fixture-content">Main content</Text>
        </ScreenLayout>
      )}
    </View>
  );
}

describe('Authenticated screen shell (shared by all screens)', () => {
  it('shows only auth guard when session is inactive', () => {
    const utils = render(<ScreenShellFixture />);

    expectInactiveScreenShell(utils, {
      layoutTestID: 'fixture-screen-safe-area',
      contentTestID: 'fixture-content',
    });
  });

  it('shows only layout and content when session is active', () => {
    const utils = render(
      <ScreenShellFixture
        isAuthenticated
        driver={driver}
        showMainContent
      />
    );

    expectActiveScreenShell(utils, {
      layoutTestID: 'fixture-screen-safe-area',
      contentTestID: 'fixture-content',
    });
  });

  it('places the header below the status bar via paddingTop (all ScreenLayout screens)', () => {
    const { getByTestId } = render(
      <ScreenLayout title="Any screen" subtitle="Any subtitle">
        <Text>Body</Text>
      </ScreenLayout>
    );

    expectHeaderClearsStatusBar(getByTestId(SHELL_TEST_IDS.screenHeader), 55);
  });

  it('detects broken shell when auth guard and layout stack together', () => {
    const utils = render(
      <View style={{ flex: 1 }}>
        <AuthGuard isAuthenticated={false} driver={null} />
        <ScreenLayout testID="broken-screen" title="Broken">
          <Text testID="broken-content">Should not stack</Text>
        </ScreenLayout>
      </View>
    );

    expect(isShellBroken(utils, { layoutTestID: 'broken-screen-safe-area' })).toBe(true);
  });
});
