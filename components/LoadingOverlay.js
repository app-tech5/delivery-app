import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../global';

const LoadingOverlay = ({
  visible,
  text,
  size = 'large',
  color = colors.primary,
  backgroundColor = 'rgba(255, 255, 255, 0.8)',
  containerStyle,
  textStyle
}) => {
  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor }, containerStyle]}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={[styles.text, textStyle]}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  text: {
    marginTop: 10,
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default LoadingOverlay;


