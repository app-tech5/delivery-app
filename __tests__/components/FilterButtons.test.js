import React from 'react';
import { render } from '@testing-library/react-native';
import FilterButtons from '../../components/FilterButtons';

jest.mock('react-native-elements', () => {
  const React = require('react');
  const { Text } = require('react-native');

  const Icon = ({ name, type, testID }) =>
    React.createElement(Text, { testID: testID || `icon-${type}-${name}` }, `${type}:${name}`);

  return { Icon };
});

const filters = [
  { key: 'all', label: 'All', icon: 'format-list-bulleted', iconType: 'material-community' },
  { key: 'pending', label: 'Pending', icon: 'clock-outline', iconType: 'material-community' },
];

describe('FilterButtons', () => {
  it('uses each filter icon type instead of showing a missing glyph', () => {
    const { getByTestId } = render(
      <FilterButtons filters={filters} activeFilter="all" onFilterPress={jest.fn()} />
    );

    expect(getByTestId('filter-icon-all')).toBeTruthy();
    expect(getByTestId('filter-icon-pending')).toBeTruthy();
  });

  it('falls back to the default icon type when a filter has no iconType', () => {
    const { getByTestId } = render(
      <FilterButtons
        filters={[{ key: 'today', label: 'Today', icon: 'calendar-today' }]}
        activeFilter="today"
        onFilterPress={jest.fn()}
        iconType="material-community"
      />
    );

    expect(getByTestId('filter-icon-today')).toBeTruthy();
  });
});
