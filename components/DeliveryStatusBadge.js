import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../global';
import { DELIVERY_STATUS_COLORS, getDeliveryStatusLabel } from '../utils';

const DeliveryStatusBadge = ({ status, compact = false }) => {
  const statusLabel = getDeliveryStatusLabel(status);
  const backgroundColor = DELIVERY_STATUS_COLORS[status] || colors.text.secondary;

  return (
    <View
      style={[
        styles.badge,
        compact && styles.badgeCompact,
        { backgroundColor },
      ]}
    >
      <Text
        style={[styles.badgeText, compact && styles.badgeTextCompact]}
        numberOfLines={1}
      >
        {statusLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 28,
    borderRadius: 16,
    marginBottom: 4,
  },
  badgeCompact: {
    flex: 1,
    alignSelf: 'stretch',
    marginHorizontal: 8,
    marginBottom: 0,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 16,
  },
  badgeTextCompact: {
    fontSize: 11,
    lineHeight: 14,
  },
});

export default DeliveryStatusBadge;
