import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../global';
import { useMapMarkerCallout } from './MapEntityMarker';

export default function MapSelectionPanel({ resolveCallout }) {
  const { activeId, clearIfActive } = useMapMarkerCallout() || {};

  if (!activeId || typeof resolveCallout !== 'function') {
    return null;
  }

  const callout = resolveCallout(activeId);
  if (!callout?.title) {
    return null;
  }

  return (
    <View style={styles.panel} accessibilityRole="summary">
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {callout.title}
        </Text>
        {callout.subtitle ? (
          <Text style={styles.subtitle} numberOfLines={3}>
            {callout.subtitle}
          </Text>
        ) : null}
      </View>
      <TouchableOpacity
        onPress={() => clearIfActive(activeId)}
        style={styles.closeButton}
        accessibilityRole="button"
        accessibilityLabel="Close"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close" size={20} color={colors.text.secondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.background.secondary,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  content: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.text.secondary,
  },
  closeButton: {
    padding: 2,
  },
});
