import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import ScreenHeader from '../../components/ScreenHeader';

describe('ScreenHeader (auth)', () => {
  it('renders sign-in title and subtitle', () => {
    const { getByText } = render(
      <ScreenHeader
        title="Good Food Driver"
        subtitle="Sign in to your account"
      />
    );

    expect(getByText('Good Food Driver')).toBeTruthy();
    expect(getByText('Sign in to your account')).toBeTruthy();
  });

  it('renders auth children such as demo mode banner', () => {
    const { getByText } = render(
      <ScreenHeader
        title="Good Food Driver"
        subtitle="Sign in to your account"
      >
        <Text>Demo Mode Active</Text>
      </ScreenHeader>
    );

    expect(getByText('Demo Mode Active')).toBeTruthy();
  });

  it('applies custom auth title and subtitle styles', () => {
    const { getByText } = render(
      <ScreenHeader
        title="Good Food Driver"
        subtitle="Sign in to your account"
        titleStyle={{ fontSize: 28 }}
        subtitleStyle={{ fontSize: 16 }}
      />
    );

    expect(getByText('Good Food Driver').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ fontSize: 28 })])
    );
    expect(getByText('Sign in to your account').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ fontSize: 16 })])
    );
  });
});
