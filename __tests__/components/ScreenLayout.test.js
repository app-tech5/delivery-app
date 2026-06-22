import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import ScreenLayout from '../../components/ScreenLayout';

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    SafeAreaView: ({ children, style, edges, testID }) =>
      React.createElement(
        View,
        {
          style,
          testID: testID || 'safe-area-view',
          accessibilityLabel: edges ? edges.join(',') : undefined,
        },
        children
      ),
    useSafeAreaInsets: () => ({ top: 47, bottom: 34, left: 0, right: 0 }),
  };
});

const mockOpenDrawer = jest.fn();

jest.mock('@react-navigation/native', () => ({
  DrawerActions: {
    openDrawer: () => ({ type: 'OPEN_DRAWER' }),
  },
  useNavigation: () => ({
    openDrawer: mockOpenDrawer,
    dispatch: jest.fn(),
  }),
}));

describe('ScreenLayout', () => {
  beforeEach(() => {
    mockOpenDrawer.mockClear();
  });

  it('renders hamburger menu by default and opens the drawer on press', () => {
    const { getByTestId } = render(
      <ScreenLayout title="Home">
        <Text>Body</Text>
      </ScreenLayout>
    );

    const menuButton = getByTestId('hamburger-button');
    expect(menuButton).toBeTruthy();

    const { fireEvent } = require('@testing-library/react-native');
    fireEvent.press(menuButton);
    expect(mockOpenDrawer).toHaveBeenTimes(1);
  });

  it('extends the header under the status bar with safe-area top padding', () => {
    const { getByTestId } = render(
      <ScreenLayout title="Deliveries" subtitle="3 deliveries">
        <Text>Body</Text>
      </ScreenLayout>
    );

    const safeArea = getByTestId('screen-layout-safe-area');
    const header = getByTestId('screen-header');

    expect(safeArea.props.accessibilityLabel).toBe('left,right,bottom');
    expect(header.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ paddingTop: 55 })])
    );
  });

  it('forwards header props and renders children below the header', () => {
    const { getByText, getByTestId } = render(
      <ScreenLayout
        title="John Driver"
        subtitle="ID: DL-12345"
        rightComponent={<Text testID="status-badge">available</Text>}
      >
        <Text testID="screen-body">Dashboard body</Text>
      </ScreenLayout>
    );

    expect(getByText('John Driver')).toBeTruthy();
    expect(getByText('ID: DL-12345')).toBeTruthy();
    expect(getByTestId('status-badge')).toBeTruthy();
    expect(getByTestId('screen-body')).toBeTruthy();
  });

  it('merges custom header container styles', () => {
    const { getByTestId } = render(
      <ScreenLayout
        title="Home"
        headerContainerStyle={{ borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}
      >
        <Text>Body</Text>
      </ScreenLayout>
    );

    expect(getByTestId('screen-header').props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }),
      ])
    );
  });
});
